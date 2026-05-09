import React from 'react';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfaf8] text-[#444444] font-sans">
      <div className="text-center p-8 max-w-lg">
        <h1 className="text-4xl font-serif font-bold text-[#2a8c7e] mb-4">Flora 40+</h1>
        <p className="text-lg opacity-80 mb-6">
          A estrutura base HTML5 foi configurada no diretório public. 
          Este ambiente React está pronto para receber os componentes do seu dashboard SaaS.
        </p>
        <div className="flex justify-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#a3d9d3]"></div>
          <div className="w-8 h-8 rounded-full bg-[#e8c7c8]"></div>
          <div className="w-8 h-8 rounded-full bg-[#2a8c7e]"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
