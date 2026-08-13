"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Droplet, 
  Droplets, 
  Zap, 
  ShieldCheck, 
  Truck, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Menu, 
  X, 
  Building2, 
  UtensilsCrossed, 
  Hotel, 
  GraduationCap, 
  Phone, 
  MessageCircle, 
  ChevronRight, 
  Lock, 
  Leaf, 
  Recycle, 
  Award,
  CalendarCheck,
  Calculator,
  Megaphone,
  Star,
  Home,
  MapPin,
  HelpCircle,
  Users
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  
  // Calculadora Interativa
  const [calcLitros, setCalcLitros] = useState<number>(100);

  // Form State
  const [formData, setFormData] = useState({
    nomeEmpresa: "",
    tipoNegocio: "Restaurante / Bar",
    responsavel: "",
    whatsapp: "",
    bairroCidade: "",
    volumeMensal: "50L a 100L"
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const openModalWithTipo = (tipo: string) => {
    setFormData(prev => ({ ...prev, tipoNegocio: tipo }));
    setFormSubmitted(false);
    setShowSignupModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = "5521999999999"; // Contato PacÓleo
    const text = `🌿 *Solicitação de Parceria / Coleta PacÓleo*\n\n` +
      `🏢 *Estabelecimento / Nome:* ${formData.nomeEmpresa}\n` +
      `🏷️ *Modalidade:* ${formData.tipoNegocio}\n` +
      `👤 *Responsável:* ${formData.responsavel}\n` +
      `📱 *WhatsApp:* ${formData.whatsapp}\n` +
      `📍 *Localização:* ${formData.bairroCidade}\n` +
      `🛢️ *Volume Estimado:* ${formData.volumeMensal}\n\n` +
      `Olá! Gostaria de mais informações e de iniciar a parceria com a PacÓleo.`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setFormSubmitted(true);
  };

  const odsList = [
    {
      number: 6,
      title: "Água Potável & Saneamento",
      desc: "Evita o descarte em ralos e redes de esgoto, impedindo a contaminação de rios e aquíferos.",
      image: "/ods/ods6.jpeg"
    },
    {
      number: 12,
      title: "Consumo e Produção Responsáveis",
      desc: "Incentiva a logística reversa e a economia circular de óleos e gorduras vegetais.",
      image: "/ods/ods12.jpeg"
    },
    {
      number: 13,
      title: "Ação Contra a Mudança do Clima",
      desc: "Fomenta a substituição de combustíveis fósseis poluentes por biodiesel limpo.",
      image: "/ods/ods13.jpeg"
    },
    {
      number: 14,
      title: "Vida na Água",
      desc: "Preserva a oxigenação e impede a formação de películas nocivas à fauna aquática.",
      image: "/ods/ods14.jpeg"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-[#3DB5D9] selection:text-white font-sans">
      
      {/* NAVBAR SUPERIOR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative w-44 sm:w-52 h-12 transition-transform group-hover:scale-105">
              <Image 
                src="/logo-colorida.png" 
                alt="PacÓleo Coleta e Reciclagem" 
                fill 
                className="object-contain object-left" 
                priority
              />
            </div>
          </Link>

          {/* Links de Navegação Desktop */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#o-que-fazemos" className="hover:text-[#3DB5D9] transition-colors">O que fazemos</a>
            <a href="#formas-de-coleta" className="hover:text-[#3DB5D9] transition-colors">Formas de Coleta</a>
            <a href="#como-funciona" className="hover:text-[#3DB5D9] transition-colors">Como Funciona</a>
            <a href="#calculadora" className="hover:text-[#3DB5D9] transition-colors">Calculadora</a>
            <a href="#ods" className="hover:text-[#3DB5D9] transition-colors">ODS & Impacto</a>
          </nav>

          {/* Botões de Ação Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-[#3DB5D9] hover:border-[#3DB5D9] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Lock size={14} className="text-[#3DB5D9]" />
              <span>Entrar no Portal</span>
            </Link>

            <button
              onClick={() => openModalWithTipo("Restaurante / Bar")}
              className="px-5 py-2.5 rounded-xl bg-[#3DB5D9] hover:bg-[#329fbe] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#3DB5D9]/25 hover:shadow-[#3DB5D9]/40 transition-all hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Cadastre seu Negócio</span>
            </button>
          </div>

          {/* Botão Hambúrguer Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/login"
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-[#3DB5D9] text-xs font-bold"
            >
              Login
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:text-[#3DB5D9] hover:bg-slate-200 transition-colors"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Drawer Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200 shadow-xl">
            <nav className="flex flex-col space-y-3 font-semibold text-slate-700 text-sm">
              <a 
                href="#o-que-fazemos" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>O que fazemos</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
              <a 
                href="#formas-de-coleta" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>Formas de Coleta</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
              <a 
                href="#como-funciona" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>Como Funciona</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
              <a 
                href="#calculadora" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>Calculadora Ecológica</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
              <a 
                href="#ods" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>Compromisso ODS (ONU)</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
            </nav>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openModalWithTipo("Restaurante / Bar");
                }}
                className="w-full py-3 rounded-xl bg-[#3DB5D9] text-white font-bold text-sm shadow-md text-center flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                <span>Solicitar Coleta / Cadastre-se</span>
              </button>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm text-center flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                <span>Acessar Portal do Cliente</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-96 bg-[#3DB5D9]/15 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3DB5D9]/10 border border-[#3DB5D9]/20 text-[#248dae] text-xs font-bold uppercase tracking-wider shadow-xs">
              <Leaf size={14} className="text-[#3DB5D9]" />
              <span>Logística Reversa & Rastreabilidade B2B</span>
            </div>

            {/* H1 Principal */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Transforme o óleo usado do seu negócio em <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3DB5D9] via-[#2ba5cb] to-[#1681a0]">energia limpa e impacto positivo.</span>
            </h1>

            {/* Subtítulo */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Coleta especializada e gratuita de óleo vegetal usado para <strong>restaurantes, condomínios, hotéis e empresas</strong>. Fornecemos bombonas seguras, laudos ambientais e emissão oficial de <strong>MTR & CDF</strong>.
            </p>

            {/* CTAs Principais */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => openModalWithTipo("Restaurante / Bar")}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#3DB5D9] hover:bg-[#329fbe] text-white font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-[#3DB5D9]/30 hover:shadow-[#3DB5D9]/50 transition-all hover:-translate-y-1 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                <span>Solicitar Coleta Gratuita</span>
              </button>

              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-sm uppercase tracking-wider shadow-sm transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Lock size={18} className="text-[#3DB5D9]" />
                <span>Acessar Portal do Cliente</span>
              </Link>
            </div>

            {/* Selos de Confiança */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-200/80 mt-12">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Coleta Sem Custo</h4>
                  <p className="text-[11px] text-slate-500">Logística 100% gratuita</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">MTR & CDF</h4>
                  <p className="text-[11px] text-slate-500">Conformidade com órgãos</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Truck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Bombonas Grátis</h4>
                  <p className="text-[11px] text-slate-500">Recipientes adequados</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Award size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Portal Online</h4>
                  <p className="text-[11px] text-slate-500">Indicadores e laudos 24h</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SEÇÃO NOBRE: O QUE FAZEMOS */}
      <section id="o-que-fazemos" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#3DB5D9] tracking-tight">
              O que fazemos
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Conheça as três frentes fundamentais do trabalho da PacÓleo para transformar resíduos em sustentabilidade real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pilar 1: Coleta de óleo usado */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 hover:border-[#3DB5D9]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-center items-center group hover:-translate-y-1">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-[#3DB5D9]/10 text-[#0284C7] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Droplets size={44} className="stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-extrabold text-[#0284C7] mb-4">
                  Coleta de óleo usado
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Realizamos a coleta do óleo vegetal usado e direcionamos o resíduo para um local de reciclagem, transformando ele em um novo produto.
                </p>
              </div>
            </div>

            {/* Pilar 2: Gerenciamento do óleo recolhido */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 hover:border-[#3DB5D9]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-center items-center group hover:-translate-y-1">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-[#3DB5D9]/10 text-[#0284C7] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Recycle size={44} className="stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-extrabold text-[#0284C7] mb-4">
                  Gerenciamento do óleo recolhido
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Transformamos o óleo vegetal recolhido nos estabelecimentos, condomínios e domicílios conscientes, em produtos e ações sustentáveis.
                </p>
              </div>
              <a
                href="#ods"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-sm transition-all"
              >
                <span>Ver Ações Sustentáveis</span>
                <ChevronRight size={14} />
              </a>
            </div>

            {/* Pilar 3: Marketing verde */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 hover:border-[#3DB5D9]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-center items-center group hover:-translate-y-1">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-[#3DB5D9]/10 text-[#0284C7] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Megaphone size={44} className="stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-extrabold text-[#0284C7] mb-4">
                  Marketing verde
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Damos visibilidade ao impacto gerado nas coletas nos estabelecimentos, condomínios e domicílios conscientes.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SEÇÃO NOBRE: FORMAS DE COLETA */}
      <section id="formas-de-coleta" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#3DB5D9] tracking-tight">
              Formas de coleta
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Atendemos diferentes perfis de geradores com logística adaptada e eficiente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Pac Ponto */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#0284C7]/30 transition-all duration-300 flex flex-col justify-between items-center text-center group hover:-translate-y-1">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Star size={34} className="fill-[#0284C7] stroke-[#0284C7]" />
                </div>
                <h3 className="text-lg font-extrabold text-[#0284C7] mb-2">
                  Pac Ponto
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Disponibilizamos pontos de coleta voluntários para recolhimento do óleo.
                </p>
              </div>
              <button
                onClick={() => openModalWithTipo("Pac Ponto / Ponto de Coleta")}
                className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                Saiba mais
              </button>
            </div>

            {/* Card 2: Domicílio */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#0284C7]/30 transition-all duration-300 flex flex-col justify-between items-center text-center group hover:-translate-y-1">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Home size={34} className="fill-[#0284C7] stroke-[#0284C7]" />
                </div>
                <h3 className="text-lg font-extrabold text-[#0284C7] mb-2">
                  Domicílio
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Realizamos a coleta do óleo vegetal direto na sua porta.
                </p>
              </div>
              <button
                onClick={() => openModalWithTipo("Domicílio")}
                className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                Saiba mais
              </button>
            </div>

            {/* Card 3: Condomínio */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#0284C7]/30 transition-all duration-300 flex flex-col justify-between items-center text-center group hover:-translate-y-1">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Building2 size={34} className="stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-extrabold text-[#0284C7] mb-2">
                  Condomínio
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Implantamos o ponto de coleta adequado às necessidades do seu condomínio.
                </p>
              </div>
              <button
                onClick={() => openModalWithTipo("Condomínio Residencial")}
                className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                Saiba mais
              </button>
            </div>

            {/* Card 4: Restaurante */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#0284C7]/30 transition-all duration-300 flex flex-col justify-between items-center text-center group hover:-translate-y-1">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <UtensilsCrossed size={34} className="stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-extrabold text-[#0284C7] mb-2">
                  Restaurante
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Realizamos a coleta com a periodicidade e documentação que seu restaurante precisa.
                </p>
              </div>
              <button
                onClick={() => openModalWithTipo("Restaurante / Bar")}
                className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                Saiba mais
              </button>
            </div>

          </div>

          {/* PERGUNTA: MAS EU NÃO GERO ÓLEO USADO? */}
          <div className="mt-14 bg-gradient-to-r from-sky-500/10 via-[#3DB5D9]/15 to-emerald-500/10 rounded-3xl p-8 border border-[#3DB5D9]/30 text-center max-w-4xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 text-[#0284C7] text-xs font-black uppercase tracking-wider">
              <HelpCircle size={16} />
              <span>Engajamento & Parcerias</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Mas eu não gero óleo usado, como posso me tornar um parceiro?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Você pode se tornar um <strong>Pac Ponto</strong> no seu comércio ou associação, incentivar a coleta no condomínio onde mora ou atuar como embaixador da sustentabilidade na sua região!
            </p>
            <div className="pt-2">
              <button
                onClick={() => openModalWithTipo("Parceiro / Pac Ponto")}
                className="px-6 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Users size={16} />
                <span>Quero ser um Parceiro / Pac Ponto</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO: COMO FUNCIONA O PROCESSO (4 PASSOS) */}
      <section id="como-funciona" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#3DB5D9] bg-[#3DB5D9]/10 px-3 py-1 rounded-full">
              Passo a Passo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Como funciona o ciclo da PacÓleo?
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Cuidamos de todas as etapas para que seu estabelecimento tenha total tranquilidade com o descarte ecológico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Passo 1 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/70 hover:border-[#3DB5D9]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#3DB5D9]/10 text-[#3DB5D9] flex items-center justify-center font-black text-lg mb-6 group-hover:scale-110 transition-transform">
                  01
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Instalação das Bombonas</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Entregamos no seu estabelecimento recipientes limpos, vedados e adequados para o armazenamento seguro do óleo usado, sem sujeira nem vazamentos.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-semibold text-[#3DB5D9]">
                <CalendarCheck size={14} />
                <span>Fornecimento 100% gratuito</span>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/70 hover:border-[#3DB5D9]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-lg mb-6 group-hover:scale-110 transition-transform">
                  02
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Coleta Programada</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Nossa equipe realiza a coleta de forma periódica ou sob demanda, com pesagem digital e substituição imediata por bombonas higienizadas.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-semibold text-amber-600">
                <Truck size={14} />
                <span>Logística ágil e pontual</span>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/70 hover:border-[#3DB5D9]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black text-lg mb-6 group-hover:scale-110 transition-transform">
                  03
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Laudo & MTR Digital</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  A cada coleta, o volume é registrado e os certificados legais (MTR e CDF) ficam disponíveis para download no seu painel digital para alvarás e auditorias.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-semibold text-blue-600">
                <FileText size={14} />
                <span>Rastreabilidade em tempo real</span>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/70 hover:border-[#3DB5D9]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-lg mb-6 group-hover:scale-110 transition-transform">
                  04
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Energia Sustentável</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Todo o resíduo coletado é destinado a usinas certificadas para a produção de <strong>biodiesel sustentável</strong> e sabão biodegradável, fechando o ciclo ecológico.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <Zap size={14} />
                <span>100% Economia Circular</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SEÇÃO: CALCULADORA DE IMPACTO ECOLÓGICO */}
      <section id="calculadora" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3DB5D9]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Lado Esquerdo: Slider e Contexto */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#3DB5D9] text-xs font-bold uppercase tracking-wider border border-white/15">
                <Calculator size={14} />
                <span>Simulador de Preservação</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Descubra o impacto real do seu descarte correto.
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Cada litro de óleo descartado incorretamente contamina até <strong>25.000 litros de água potável</strong>. Calcule a contribuição do seu negócio:
              </p>

              <div className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                    Volume Estimado por Mês:
                  </label>
                  <span className="text-2xl font-black text-[#3DB5D9]">
                    {calcLitros} Litros
                  </span>
                </div>

                <input 
                  type="range" 
                  min="20" 
                  max="1000" 
                  step="10" 
                  value={calcLitros}
                  onChange={(e) => setCalcLitros(Number(e.target.value))}
                  className="w-full h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#3DB5D9]"
                />

                <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                  <span>20L (Pequeno)</span>
                  <span>200L (Médio)</span>
                  <span>500L</span>
                  <span>1.000L+ (Grande)</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, volumeMensal: `${calcLitros} Litros/mês` }));
                  setFormSubmitted(false);
                  setShowSignupModal(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-[#3DB5D9] hover:bg-[#329fbe] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#3DB5D9]/30 hover:shadow-[#3DB5D9]/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Quero esse impacto no meu negócio</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Lado Direito: Cards de Equivalência */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Card Água */}
              <div className="bg-gradient-to-br from-[#0284C7]/40 to-[#0369A1]/60 p-6 sm:p-7 rounded-3xl border border-sky-400/30 backdrop-blur-md space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30">
                  <Droplets size={26} />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-sky-200 tracking-wider block">Água Preservada</span>
                  <h3 className="text-3xl sm:text-4xl font-black text-white mt-1">
                    {(calcLitros * 25000).toLocaleString("pt-BR")} <span className="text-lg font-bold text-sky-200">L</span>
                  </h3>
                </div>
                <p className="text-xs text-sky-100/80 leading-relaxed">
                  Volume de água potável protegido contra contaminação química em rios e lençóis freáticos.
                </p>
              </div>

              {/* Card Biodiesel */}
              <div className="bg-gradient-to-br from-emerald-600/40 to-emerald-800/60 p-6 sm:p-7 rounded-3xl border border-emerald-400/30 backdrop-blur-md space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Zap size={26} />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-emerald-200 tracking-wider block">Biodiesel Gerado</span>
                  <h3 className="text-3xl sm:text-4xl font-black text-white mt-1">
                    {(calcLitros * 0.8).toLocaleString("pt-BR")} <span className="text-lg font-bold text-emerald-200">L</span>
                  </h3>
                </div>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  Substitui derivados do petróleo e evita a emissão de gases de efeito estufa na atmosfera.
                </p>
              </div>

              {/* Card MTR */}
              <div className="bg-gradient-to-br from-purple-600/40 to-purple-800/60 p-6 sm:p-7 rounded-3xl border border-purple-400/30 backdrop-blur-md space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <FileText size={26} />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-purple-200 tracking-wider block">Conformidade Legal</span>
                  <h3 className="text-2xl font-black text-white mt-1">
                    100% Certificado
                  </h3>
                </div>
                <p className="text-xs text-purple-100/80 leading-relaxed">
                  Emissão de Manifesto de Transporte de Resíduos (MTR) e CDF para alvarás e órgãos reguladores.
                </p>
              </div>

              {/* Card Custo Zero */}
              <div className="bg-gradient-to-br from-amber-600/40 to-amber-800/60 p-6 sm:p-7 rounded-3xl border border-amber-400/30 backdrop-blur-md space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-amber-200 tracking-wider block">Custo Financeiro</span>
                  <h3 className="text-2xl font-black text-white mt-1">
                    R$ 0,00
                  </h3>
                </div>
                <p className="text-xs text-amber-100/80 leading-relaxed">
                  Fornecimento das bombonas e logística de coleta totalmente gratuitos para o parceiro.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SEÇÃO: COMPROMISSO ODS (ONU) */}
      <section id="ods" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#3DB5D9] bg-[#3DB5D9]/10 px-3 py-1 rounded-full">
              Sustentabilidade Global
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Alinhamento aos Objetivos da ONU (ODS)
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Ao descartar com a PacÓleo, sua empresa contribui diretamente para 4 metas globais de desenvolvimento sustentável.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {odsList.map((ods) => (
              <div 
                key={ods.number}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-sm border border-slate-100 bg-white">
                    <Image 
                      src={ods.image} 
                      alt={`ODS ${ods.number} - ${ods.title}`} 
                      fill 
                      className="object-contain" 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-slate-900 text-white shrink-0">
                      ODS {ods.number}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 leading-tight">
                      {ods.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {ods.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* BANNER FINAL CTA */}
      <section className="py-16 bg-gradient-to-r from-[#3DB5D9] via-[#2ba5cb] to-[#1d7d9a] text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Pronto para transformar o descarte da sua empresa?
          </h2>
          <p className="text-white/90 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Cadastre seu estabelecimento hoje mesmo. Entregamos as bombonas e iniciamos a coleta com emissão de certificados sem nenhum custo.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openModalWithTipo("Restaurante / Bar")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              <span>Solicitar Bombonas e Coleta</span>
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Lock size={16} />
              <span>Já sou cliente (Login)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER INSTITUCIONAL */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Coluna 1: Sobre e CNPJ */}
            <div className="space-y-4 md:col-span-2">
              <div className="relative w-44 sm:w-52 h-12">
                <Image 
                  src="/logo-branca.png" 
                  alt="PacÓleo Coleta e Reciclagem" 
                  fill 
                  className="object-contain object-left" 
                />
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Especialistas em logística reversa, coleta e destinação sustentável de óleo vegetal usado. Gerando impacto ecológico positivo e valor ESG para empresas e condomínios.
              </p>
              <div className="pt-1">
                <span className="inline-block text-[11px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
                  CNPJ: 44.551.744/0001-70
                </span>
              </div>
            </div>

            {/* Coluna 2: Navegação */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navegação</h4>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#o-que-fazemos" className="hover:text-[#3DB5D9] transition-colors">O que fazemos</a></li>
                <li><a href="#formas-de-coleta" className="hover:text-[#3DB5D9] transition-colors">Formas de Coleta</a></li>
                <li><a href="#como-funciona" className="hover:text-[#3DB5D9] transition-colors">Como Funciona</a></li>
                <li><a href="#calculadora" className="hover:text-[#3DB5D9] transition-colors">Calculadora de Impacto</a></li>
                <li><a href="#ods" className="hover:text-[#3DB5D9] transition-colors">Metas ODS</a></li>
              </ul>
            </div>

            {/* Coluna 3: Portal do Cliente */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Portal do Cliente</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/login" className="hover:text-[#3DB5D9] transition-colors">Acessar Conta (Login)</Link></li>
                <li><Link href="/primeiro-acesso" className="hover:text-[#3DB5D9] transition-colors">Primeiro Acesso (Ativar Senha)</Link></li>
                <li><a href="https://wa.me/5521999999999" target="_blank" rel="noopener noreferrer" className="hover:text-[#3DB5D9] transition-colors">Suporte via WhatsApp</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} PacÓleo Coleta e Reciclagem • CNPJ 44.551.744/0001-70</p>
            <p className="flex items-center gap-1.5">
              <span>Feito com compromisso pelo meio ambiente 🌱</span>
            </p>
          </div>

        </div>
      </footer>

      {/* MODAL DE CADASTRO / SOLICITAR COLETA */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#3DB5D9]/10 text-[#3DB5D9] flex items-center justify-center">
                  <Leaf size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Solicitar Coleta / Parceria</h3>
                  <p className="text-xs text-slate-400">Cadastre seu negócio para receber as bombonas gratuitas</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSignupModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {formSubmitted ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-900">Solicitação Iniciada!</h4>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Sua mensagem foi gerada e enviada para a nossa equipe no WhatsApp. Em instantes confirmaremos o cronograma de entrega das bombonas.
                  </p>
                  <button
                    onClick={() => setShowSignupModal(false)}
                    className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider mt-4 cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Nome do Estabelecimento / Responsável</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.nomeEmpresa}
                      onChange={(e) => setFormData({ ...formData, nomeEmpresa: e.target.value })}
                      placeholder="Ex: Restaurante Sabor do Rio, Condomínio Solar ou Nome" 
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#3DB5D9]/30 focus:border-[#3DB5D9] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Forma de Coleta / Tipo</label>
                      <select 
                        value={formData.tipoNegocio}
                        onChange={(e) => setFormData({ ...formData, tipoNegocio: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#3DB5D9]/30 focus:border-[#3DB5D9] outline-none bg-white"
                      >
                        <option value="Restaurante / Bar">Restaurante / Bar</option>
                        <option value="Condomínio Residencial">Condomínio</option>
                        <option value="Domicílio">Domicílio</option>
                        <option value="Pac Ponto / Ponto de Coleta">Pac Ponto</option>
                        <option value="Hotel / Pousada">Hotel / Pousada</option>
                        <option value="Escola / Universidade">Escola / Faculdade</option>
                        <option value="Parceiro / Pac Ponto">Quero ser Parceiro</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Volume Mensal Aprox.</label>
                      <select 
                        value={formData.volumeMensal}
                        onChange={(e) => setFormData({ ...formData, volumeMensal: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#3DB5D9]/30 focus:border-[#3DB5D9] outline-none bg-white"
                      >
                        <option value="Até 50L/mês">Até 50 Litros / mês</option>
                        <option value="50L a 100L/mês">50L a 100 Litros / mês</option>
                        <option value="100L a 300L/mês">100L a 300 Litros / mês</option>
                        <option value="Mais de 300L/mês">Mais de 300 Litros / mês</option>
                        <option value="Ainda não sei estimar">Ainda não sei estimar</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Nome do Contato</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.responsavel}
                        onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                        placeholder="Ex: Carlos Oliveira" 
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#3DB5D9]/30 focus:border-[#3DB5D9] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">WhatsApp / Telefone</label>
                      <input 
                        type="tel" 
                        required 
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="(21) 99999-9999" 
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#3DB5D9]/30 focus:border-[#3DB5D9] outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Bairro e Cidade</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.bairroCidade}
                      onChange={(e) => setFormData({ ...formData, bairroCidade: e.target.value })}
                      placeholder="Ex: Copacabana, Rio de Janeiro - RJ" 
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#3DB5D9]/30 focus:border-[#3DB5D9] outline-none"
                    />
                  </div>

                  <div className="pt-3 space-y-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-[#3DB5D9] hover:bg-[#329fbe] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#3DB5D9]/25 hover:shadow-[#3DB5D9]/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle size={16} />
                      <span>Enviar e Falar pelo WhatsApp</span>
                    </button>
                    <p className="text-[11px] text-slate-400 text-center">
                      🔒 Seus dados são confidenciais e utilizados apenas para agendamento da coleta.
                    </p>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
