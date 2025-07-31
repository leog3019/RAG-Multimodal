import './App.css';
import SearchComponent from './components/search_component.jsx';
import Header from './components/header.jsx';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <SearchComponent />
      </main>
    </div>
  );
}

export default App;
