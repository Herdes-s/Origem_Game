import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // autoUpdate: quando existir uma versão nova publicada, o service
      // worker novo assume e a próxima navegação já carrega ela — sem
      // precisar de nenhum botão "atualizar" clicado pelo jogador.
      registerType: 'autoUpdate',

      // Ícones e sprites/texturas do jogo entram no cache do app pra
      // funcionar offline depois da primeira visita.
      includeAssets: ['assets/**/*.png', 'icons/**/*.png'],

      manifest: {
        name: 'Origem',
        short_name: 'Origem',
        description: 'RPG top-down com atributos, level up e combate.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // Pré-cacheia tudo que o build gera (JS/CSS/HTML) + as imagens do
        // jogo (sprites, texturas de tile, ícones) — isso é o que permite
        // abrir o jogo sem internet depois da primeira visita.
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
    }),
  ],
})