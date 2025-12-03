import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logomac.jpg";
import logoAUF from "../assets/LogoAUF.png";
import logoLARSLAM from "../assets/LogoLARSLAM.png";
import logoFLSH from "../assets/LogoFLSH.png";
import logoUIZ from "../assets/LogoUIZ.png";

const logos = [logoAUF, logoLARSLAM, logoUIZ, logoFLSH];

function Footer() {
  return (
    <footer className="bg-neutral-primary-soft">
      <div className="mx-auto w-full max-w-7xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link to={"/"} className="flex items-center justify-center md:justify-start">
              <img src={logo} className="h-7 me-3 rounded-lg" alt="mac logo" />
              <span className="text-heading self-center text-2xl font-semibold whitespace-nowrap">
                MAC Enquête
              </span>
            </Link>
          </div>
          <div className="flex justify-between items-center gap-8 sm:gap-6">
            {logos.map((logoSrc, index) => {
              // Check if the current image is the FLSH logo
              const isFLSH = logoSrc === logoFLSH;

              // If it is FLSH, use bigger height classes. Otherwise, use standard.
              // Standard: h-10 sm:h-12 md:h-14 lg:h-20
              // FLSH:     h-14 sm:h-16 md:h-20 lg:h-28 (Just an example, adjust as needed)
              const sizeClasses = isFLSH
                ? "h-14 sm:h-16 md:h-20 lg:h-28" 
                : "h-10 sm:h-12 md:h-14 lg:h-20";

              return (
                <img
                  key={index}
                  className={`inline-block rounded-lg ${sizeClasses}`}
                  src={logoSrc}
                  alt={`logo ${index + 1}`}
                />
              );
            })}
          </div>
        </div>
        <hr className="my-6 border-default sm:mx-auto lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-body sm:text-center">
            © 2025{" "}
            <Link to="/" className="hover:underline">
              MAC Enquête
            </Link>
            . All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:justify-center sm:mt-0">
            <a href="#" className="text-body hover:text-heading">
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M13.135 6H15V3h-1.865a4.147 4.147 0 0 0-4.142 4.142V9H7v3h2v9.938h3V12h2.021l.592-3H12V6.591A.6.6 0 0 1 12.592 6h.543Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Facebook page</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;