import { useMemo, useState } from "react";
import { FaArrowLeft, FaCopy, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import styles from "./DonatePage.module.scss";
import { buildPixPayload } from "../../utils/pix";

// TODO: troque pelos seus dados reais
const PIX_KEY = "b92350d5-67b7-40e6-b413-d6eb71d85493";
const MERCHANT_NAME = "Ernand Soares dos Santos";
const MERCHANT_CITY = "CANINDE SF";

const PRESET_VALUES = [5, 10, 20, 50];

function DonatePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | "livre">(10);
  const [customValue, setCustomValue] = useState("");
  const [copied, setCopied] = useState(false);

  const amount = useMemo(() => {
    if (selected === "livre") return undefined; // valor livre: doador digita no próprio banco
    return selected;
  }, [selected]);

  const payload = useMemo(
    () =>
      buildPixPayload({
        pixKey: PIX_KEY,
        merchantName: MERCHANT_NAME,
        merchantCity: MERCHANT_CITY,
        amount,
        description: "Doacao Origem",
      }),
    [amount]
  );

  function handleSelectPreset(value: number) {
    setSelected(value);
    setCustomValue("");
    setCopied(false);
  }

  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
    setCustomValue(raw);
    const parsed = parseFloat(raw);
    setSelected(!raw || isNaN(parsed) ? "livre" : parsed);
    setCopied(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className={styles.donate_page}>
      <button className={styles.back_btn} onClick={() => navigate("/")}>
        <FaArrowLeft /> Voltar
      </button>

      <h1 className={styles.title}>DOAR VIA PIX</h1>
      <p className={styles.sub_title}>Escolha um valor ou digite o quanto quiser</p>

      <div className={styles.preset_group}>
        {PRESET_VALUES.map((value) => (
          <button
            key={value}
            className={`${styles.preset_btn} ${
              selected === value ? styles.active : ""
            }`}
            onClick={() => handleSelectPreset(value)}
          >
            R$ {value}
          </button>
        ))}
        <button
          className={`${styles.preset_btn} ${
            selected === "livre" && !customValue ? styles.active : ""
          }`}
          onClick={() => {
            setSelected("livre");
            setCustomValue("");
            setCopied(false);
          }}
        >
          Livre
        </button>
      </div>

      <input
        className={styles.custom_input}
        type="text"
        inputMode="decimal"
        placeholder="Ou digite um valor (R$)"
        value={customValue}
        onChange={handleCustomChange}
      />

      <div className={styles.qr_box}>
        <QRCodeSVG value={payload} size={220} marginSize={2} />
      </div>

      <button className={styles.copy_btn} onClick={handleCopy}>
        {copied ? <FaCheck /> : <FaCopy />}
        {copied ? "Copiado!" : "Copiar código Pix"}
      </button>

      <p className={styles.hint}>
        Abre o app do seu banco, escolhe Pix &gt; Pix Copia e Cola (ou escaneia o QR
        Code) e cola o código copiado.
      </p>
    </section>
  );
}

export default DonatePage;
