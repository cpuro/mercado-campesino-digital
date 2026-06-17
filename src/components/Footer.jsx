import LogoCIVICUS from '/logos/CIVICUSlogo.png';
import LogoDemocraTICAS from '/logos/DemocraTICaLogo.png';
import DigitalDemocracyInicitive from '/logos/DigitalDemocracyInitiativeDDI.png';
import Pasoapaso from '/logos/pplogo.png';
import React from 'react';
import { Link } from 'react-router-dom';
import { TbSeparator } from "react-icons/tb";
import LogoCard from '@/components/LogoCard';

export default function Footer() {
  return (
    <footer className="bg-green-800 text-white">
      {/* Contenedor principal */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Mensaje de financiamiento */}
        <div className="mb-12 text-center">
          <p className="text-white text-base md:text-lg leading-relaxed">
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
          <h3 className="text-center text-base md:text-lg uppercase tracking-widest text-white mb-8">
            Aliados y Financiadores
          </h3>
          
          {/* Grid de logos (tarjetas 3D reutilizables) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
            <LogoCard image={LogoDemocraTICAS} alt="DemocráTICa" />
            <LogoCard image={DigitalDemocracyInicitive} alt="Digital Democracy Initiative" />
            <LogoCard image={LogoCIVICUS} alt="CIVICUS" />
            <LogoCard image={Pasoapaso} alt="Paso a Paso" />
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
          <div className="flex flex-col md:flex-row justify-between items-center text-base md:text-lg space-y-4 md:space-y-0">
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
