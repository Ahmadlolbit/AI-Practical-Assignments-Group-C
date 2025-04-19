// App.tsx
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Sudoku from './components/Sudoku';


const App = () => {
    const buttonConfig = [
        { id: 1, label: 'Sudoku Solver', path: '/sudoku' },
        { id: 2, label: 'Project 2', path: '/project2' },
        { id: 3, label: 'Project 3', path: '/project3' },
        { id: 4, label: 'Project 4', path: '/project4' },
    ];

    return (
        <BrowserRouter>
            <div className="min-h-screen flex flex-col">
                <Header />

                <main className="flex-grow p-8 bg-[rgb(23,23,23)]">
                    <Routes>
                        {/* Home route with button grid */}
                        <Route path="/" element={
                            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {buttonConfig.map((btn) => (
                                    <Button key={btn.id} label={btn.label} path={btn.path} />
                                ))}
                            </div>
                        } />

                        {/* Add routes for your components */}
                        <Route path="/sudoku" element={<Sudoku />} />
                        {/* Add routes for other projects similarly */}
                    </Routes>
                </main>

                <Footer />
            </div>
        </BrowserRouter>
    );
};

// Updated Button component using Link
const Button = ({ label, path }: { label: string; path: string }) => (
    <Link
        to={path}
        className="bg-[rgb(218,0,55)] text-[rgb(237,237,237)] p-6 rounded-lg
          hover:bg-[rgb(200,0,50)] transition-colors duration-200
          text-center font-medium text-lg shadow-lg
          transform hover:scale-105"
    >
        {label}
    </Link>
);

export default App;