import { Link } from "react-router-dom"

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-12 pb-8">
            <div className="container-wide px-4">
                <div className="grid md:grid-cols-4 gap-8">

                    <div>
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-20 h-20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <img src="./img/logo.png" alt="PGNLA Logo" loading="lazy" />
                            </div>
                            <span className="text-2xl font-bold font-serif text-white font-main">Pequeños Gigantes</span>
                        </div>

                        {/*
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white text-xl">
                                <i className="fab fa-facebook"></i>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white text-xl">
                                <i className="fab fa-instagram"></i>
                            </a>
                        </div>
                        */}
                        
                    </div>


                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/home" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            {/*
                            <li><Link to="/registration" className="hover:text-white transition-colors">Admissions</Link></li>
                            <li><Link to="/student-life" className="hover:text-white transition-colors">Student Life</Link>
                            </li>
                            <li><Link to="/calendar" className="hover:text-white transition-colors">School Calendar</Link>
                            </li>
                            */}
                        </ul>
                    </div>


                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">For Parents</h3>
                        <ul className="space-y-3">
                            <li><Link to="/login" className="hover:text-white transition-colors">Parent Portal</Link></li>
                            <li><Link to="/parent-dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                            </li>
                            {/*
                            <li><Link to="/yearbook" className="hover:text-white transition-colors">Yearbook</Link></li>
                            <li><Link to="/gallery" className="hover:text-white transition-colors">Photo Gallery</Link></li>
                            
                            <li><Link to="/rules" className="hover:text-white transition-colors">School Handbook</Link></li>
                            */}
                        </ul>
                    </div>


                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <i className="fas fa-map-marker-alt text-primary-red mt-1 mr-3"></i>
                                <span>8 Boothman Drive<br></br>St. Augustine</span>
                            </li>
                            <li className="flex items-center">
                                <i className="fas fa-phone text-primary-red mr-3"></i>
                                <span>1(868) 681-6554</span>
                            </li>
                            <li className="flex items-center">
                                <i className="fas fa-envelope text-primary-red mr-3"></i>
                                <span>pequenosacademy@gmail.com</span>
                            </li>

                        </ul>
                    </div>
                </div>


                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p>&copy; 2025 Pequeños Gigantes Nursery and Learning Academy. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
