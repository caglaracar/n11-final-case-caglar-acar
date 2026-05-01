import './i18n'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// NOT: StrictMode dev modda her useEffect'i 2 kere çalıştırıyor; ağ
// panelinde her isteği iki kez görmemizin sebebi buydu. Production
// build'de zaten devre dışı kalıyor.
createRoot(document.getElementById('root')!).render(<App />)
