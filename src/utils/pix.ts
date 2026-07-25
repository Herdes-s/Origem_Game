/**
 * Gerador de payload Pix (padrão BR Code / EMV) para QR Code estático.
 * Baseado no "Manual de Padrões para Iniciação do Pix" do Banco Central.
 *
 * Isso NÃO gera uma chave Pix nova (isso só o banco pode fazer). Isso monta
 * o texto "Copia e Cola" / QR Code usando uma chave Pix que você já possui
 * (no seu caso, a chave aleatória gerada no app do seu banco).
 */

interface PixPayloadParams {
  /** Sua chave Pix (CPF, e-mail, telefone ou chave aleatória) */
  pixKey: string;
  /** Nome do recebedor, máx. 25 caracteres, sem acento */
  merchantName: string;
  /** Cidade do recebedor, máx. 15 caracteres, sem acento */
  merchantCity: string;
  /** Valor em reais (ex: 10.50). Omita ou deixe undefined para valor livre */
  amount?: number;
  /** Identificador da transação, até 25 caracteres. "***" = sem identificação */
  txid?: string;
  /** Mensagem opcional que aparece pro pagador */
  description?: string;
}

// Monta um campo TLV: ID (2) + Tamanho (2) + Valor
function tlv(id: string, value: string): string {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

// Remove acentos e caracteres fora do padrão aceito pelo EMV/BR Code
function sanitize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toUpperCase()
    .trim();
}

// CRC16/CCITT-FALSE, exigido pelo padrão EMV como campo final (63) do payload
function crc16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixPayload({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  txid = "***",
  description,
}: PixPayloadParams): string {
  const name = sanitize(merchantName).slice(0, 25) || "DOACAO";
  const city = sanitize(merchantCity).slice(0, 15) || "BRASIL";

  // Campo 26: Merchant Account Information - Pix (sub-campos)
  const merchantAccountInfo =
    tlv("00", "BR.GOV.BCB.PIX") +
    tlv("01", pixKey) +
    (description ? tlv("02", description.slice(0, 40)) : "");

  let payload =
    tlv("00", "01") + // Payload Format Indicator
    tlv("26", merchantAccountInfo) + // Merchant Account Information
    tlv("52", "0000") + // Merchant Category Code
    tlv("53", "986") + // Transaction Currency (986 = BRL)
    (amount ? tlv("54", amount.toFixed(2)) : "") + // Transaction Amount (omitido = valor livre)
    tlv("58", "BR") + // Country Code
    tlv("59", name) + // Merchant Name
    tlv("60", city) + // Merchant City
    tlv("62", tlv("05", txid.slice(0, 25))); // Additional Data Field (txid)

  payload += "6304"; // Abre o campo do CRC (ID 63, tamanho 04)
  const checksum = crc16(payload);

  return payload + checksum;
}
