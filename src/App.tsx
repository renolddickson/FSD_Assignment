import { Sidenav } from "./components/Sidenav";
import { MainViewport } from "./components/MainViewport";

function App() {
  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#040814] text-slate-100 font-sans antialiased">
      <Sidenav />
      <MainViewport />
    </div>
  );
}

export default App;

