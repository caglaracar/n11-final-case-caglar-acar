import { AppRoutes } from "./router";
import { AppProviders } from "./providers";
import ScrollToTop from "./components/feature/ScrollToTop";

function App() {
  return (
    <AppProviders>
      <ScrollToTop />
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
