import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logomac.jpg";
import logoAUF from "../assets/LogoAUF.png";
import logoLARSLAM from "../assets/LogoLARSLAM.png";
import logoFLSH from "../assets/LogoFLSH.png";
import logoUIZ from "../assets/LogoUIZ.png";

const logos = [logoAUF, logoLARSLAM, logoUIZ, logoFLSH, ];

function Footer() {
  return (
    <footer class="bg-neutral-primary-soft">
      <div class="mx-auto w-full max-w-7xl p-4 py-6 lg:py-8">
        <div class="md:flex md:justify-between items-center">
          <div class="mb-6 md:mb-0">
            <Link to={"/"} class="flex items-center justify-center md:justify-start">
              <img src={logo} class="h-7 me-3 rounded-lg" alt="mac logo" />
              <span class="text-heading self-center text-2xl font-semibold whitespace-nowrap">
                MAC Enquête
              </span>
            </Link>
          </div>
          <div class="flex justify-between gap-8 sm:gap-6">
            {logos.map((logoSrc, index) => (
              <img
                key={index}
                class="inline-block rounded-lg h-10 sm:h-12 md:h-14 lg:h-20"
                src={logoSrc}
                alt={`logo ${index + 1}`}
              />
            ))}
          </div>
        </div>
        <hr class="my-6 border-default sm:mx-auto lg:my-8" />
        <div class="sm:flex sm:items-center sm:justify-between">
          {/*  */}
          <span class="text-sm text-body sm:text-center">
            © 2025{" "}
            <Link to="/" class="hover:underline">
              MAC Enquête
            </Link>
            . All Rights Reserved.
          </span>
          <div class="flex mt-4 sm:justify-center sm:mt-0">
            <a href="#" class="text-body hover:text-heading">
              <svg
                class="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M13.135 6H15V3h-1.865a4.147 4.147 0 0 0-4.142 4.142V9H7v3h2v9.938h3V12h2.021l.592-3H12V6.591A.6.6 0 0 1 12.592 6h.543Z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="sr-only">Facebook page</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
