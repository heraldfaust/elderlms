import  { useContext, useState } from 'react';
import { TvMinimalPlay, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { AuthContext } from "@/context/auth-context";

const StudentViewCommonHeader = () => {
  const navigate = useNavigate();
  const { resetCredentials } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  return (
    <header className="relative border-b">
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Link to="/home" className="flex items-center hover:text-black">
            <span className="font-extrabold text-xl">
              SLM
            </span>
          </Link>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              onClick={() => {
                location.pathname.includes("/courses")
                  ? null
                  : navigate("/courses");
              }}
              className="text-base font-medium"
            >
              Explore Courses
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex gap-4 items-center">
            <div
              onClick={() => navigate("/student-courses")}
              className="flex cursor-pointer items-center gap-3"
            >
              <span className="font-extrabold text-xl">
                My Courses
              </span>
              <TvMinimalPlay className="w-8 h-8 cursor-pointer" />
            </div>
            <Button onClick={handleLogout}>Sign Out</Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Link to="/home" className="flex items-center hover:text-black">
              <span className="font-extrabold text-sm">
                SLM
              </span>
            </Link>
            <div
              onClick={() => navigate("/student-courses")}
              className="flex cursor-pointer items-center gap-2"
            >
              <span className="font-extrabold text-sm">
                My Courses
              </span>
              <TvMinimalPlay className="w-6 h-6 cursor-pointer" />
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg z-50">
            <div className="flex flex-col p-4 space-y-4">
              <Button
                variant="ghost"
                onClick={() => {
                  if (!location.pathname.includes("/courses")) {
                    navigate("/courses");
                  }
                  setIsMenuOpen(false);
                }}
                className="text-sm font-medium w-full justify-start"
              >
                Explore Courses
              </Button>
              <Button 
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default StudentViewCommonHeader;