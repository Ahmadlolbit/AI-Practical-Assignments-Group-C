// components/Header.tsx
const Header = () => (
    <header className="bg-[rgb(23,23,23)] border-b border-[rgb(68,68,68)]">
        <nav className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
                <h1 className="text-[rgb(237,237,237)] text-2xl font-bold">
                    Project Hub
                </h1>

                <div className="flex space-x-8">
                    <NavLink label="Documentation" />
                    <NavLink label="Videos" />
                    <NavLink label="About the Team" />
                </div>
            </div>
        </nav>
    </header>
);

const NavLink = ({ label }: { label: string }) => (
    <a
        href="#"
        className="text-[rgb(237,237,237)] hover:text-[rgb(218,0,55)]
              transition-colors duration-200 text-lg"
    >
        {label}
    </a>
);

export default Header;