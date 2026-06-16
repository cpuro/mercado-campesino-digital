import LogoCIVICUS from '/logos/CIVICUSlogo.png';
import LogoDemocraTICAS from '/logos/DemocraTICaLogo.png';
import DigitalDemocracyInicitive from '/logos/DigitalDemocracyInitiativeDDI.png';
import Pasoapaso from '/logos/pplogo.png';
import React from 'react';
import { Link } from 'react-router-dom';
import { TbSeparator } from "react-icons/tb";

export default function Footer() {
  return (
    <footer className="bg-green-500 text-white">
      {/* Contenedor principal */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Mensaje de financiamiento */}
        <div className="mb-12 text-center">
          <p className="text-white text-sm md:text-base leading-relaxed">
            Este proyecto es financiado por el Fondo <span className="font-semibold">DemocráTICa</span>, un programa de 
            <span className="font-semibold"> Digital Democracy Initiative (DDI)</span> implementado por 
            <span className="font-semibold"> Wingu, Civic House y Kubadili</span>, con el apoyo de 
            <span className="font-semibold"> CIVICUS</span>.
          </p>
        </div>

        {/* Sección de logos */}
          <div className="mt-8 pt-8">
          <div className="flex items-center w-full gap-1 mb-8">
            {Array.from({ length: 40 }).map((_, i) => (
              <TbSeparator key={i} className="text-white flex-1" />
            ))}
          </div>
          <h3 className="text-center text-xs uppercase tracking-widest text-white mb-8">
            Aliados y Financiadores
          </h3>
          
          {/* Grid de logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {/* Logo 1 - DemocráTICa */}
            <div className="flex items-center justify-center h-24 bg-white rounded-lg border border-white hover:border-gray-600 transition">
              <div className="text-center">
                <img src={LogoDemocraTICAS} alt="DemocráTICa" className="h-6 w-auto mx-auto" />
              </div>
            </div>

            {/* Logo 2 - DDI */}
            <div className="flex items-center justify-center h-24 bg-white rounded-lg border border-white hover:border-gray-600 transition">
              <div className="text-center">
                <img src={DigitalDemocracyInicitive} alt="Digital Democracy Initiative" className="h-10 w-auto mx-auto" />
              </div>
            </div>

                        {/* Logo 4 - CIVICUS */}
            <div className="flex items-center justify-center h-24 bg-white rounded-lg border border-white hover:border-gray-600 transition">
              <div className="text-center">
                <img src={LogoCIVICUS} alt="CIVICUS" className="h-16 w-auto mx-auto" />
              </div>
            </div>  

            {/* Logo 3 - Implementadores */}
            <div className="flex items-center justify-center h-24 bg-white rounded-lg border border-white hover:border-gray-600 transition">
              <div className="text-center">
                <img src={Pasoapaso} alt="Implementadores" className="h-12 w-auto mx-auto" />
             </div>
            </div>
          </div>
        </div>

        {/* Línea separadora */}
        <div className="mt-8 pt-8">
          <div className="flex items-center w-full gap-1 mb-8">
            {Array.from({ length: 40 }).map((_, i) => (
              <TbSeparator key={i} className="text-white flex-1" />
            ))}
          </div>
          {/* Copyright o información adicional */}
          <div className="flex flex-col md:flex-row justify-between items-center text-white text-xs space-y-4 md:space-y-0">
            <p>&copy; 2026 Mercado Campesino Digital.</p>
            <div className="flex gap-6">
              <a href="/documents/aviso-de-privacidad-paso-a-paso.pdf" className="hover:text-white transition" target="_blank" rel="noopener noreferrer">Privacidad</a>
              <a href="/documents/politica-tratamiento-de-datos-paso-a-paso.pdf" className="hover:text-white transition" target="_blank" rel="noopener noreferrer">Términos</a>
              <Link to="/contacto" className="hover:text-white transition">Contacto</Link>
            </div>
          </div>
        </div>
      </div>
    </footer> 
  );
}
