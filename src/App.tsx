
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { TabButton } from './components/TabButton';
import { ImageUploader } from './components/ImageUploader';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ResultsGrid } from './components/ResultsGrid';
import { editImageWithPrompt, generateInspirationImage } from './services/geminiService';
import { convertFileToImagePayload } from './utils/fileUtils';
import type { ImagePayload, GeneratedImage } from './types';
import { SparklesIcon, CameraIcon } from './components/Icons';

type Tab = 'transform' | 'inspire';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('transform');
  const [transformPrompt, setTransformPrompt] = useState<string>('');
  const [inspirePrompt, setInspirePrompt] = useState<string>('');
  const [imagePayload, setImagePayload] = useState<ImagePayload | null>(null);
  
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    try {
      const payload = await convertFileToImagePayload(file);
      setImagePayload(payload);
      setError(null);
    } catch (err) {
      setError('Falha ao processar o arquivo de imagem. Por favor, tente outro.');
      console.error(err);
    }
  };

  const clearResults = () => {
    setGeneratedImages([]);
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    clearResults();
    setError(null);
  }

  const handleTransformSubmit = useCallback(async () => {
    if (!imagePayload || !transformPrompt) {
      setError('Por favor, envie uma imagem e descreva a transformação.');
      return;
    }
    setIsLoading(true);
    setError(null);
    clearResults();

    const variations = [
      { title: "Sutil & Natural", promptSuffix: ", sutil e com aparência natural" },
      { title: "Chique & Moderno", promptSuffix: ", estilo chique e moderno" },
      { title: "Ousado & Glamoroso", promptSuffix: ", ousado e glamoroso" },
      { title: "Suave & Romântico", promptSuffix: ", toque suave e romântico" },
    ];

    try {
      const promises = variations.map(v => 
        editImageWithPrompt(imagePayload, `${transformPrompt}${v.promptSuffix}`)
      );
      const results = await Promise.allSettled(promises);
      const successfulResults = results
        .map((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            return {
              src: `data:image/png;base64,${result.value}`,
              title: variations[index].title,
            };
          }
          return null;
        })
        .filter((result): result is GeneratedImage => result !== null);

      if (successfulResults.length === 0) {
        setError('Não foi possível gerar nenhuma variação. A solicitação pode ter sido bloqueada. Tente um prompt diferente.');
      }
      setGeneratedImages(successfulResults);

    } catch (err: any) {
      setError(`Ocorreu um erro ao gerar as imagens: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imagePayload, transformPrompt]);

  const handleInspirationSubmit = useCallback(async () => {
    if (!inspirePrompt) {
      setError('Por favor, descreva a inspiração que você está procurando.');
      return;
    }
    setIsLoading(true);
    setError(null);
    clearResults();

    const variations = [
      { title: "Minimalista & Conceitual", promptSuffix: ", estilo minimalista, conceitual, limpo" },
      { title: "Vibrante & Artístico", promptSuffix: ", estilo vibrante, artístico, com cores ousadas" },
      { title: "Clássico & Elegante", promptSuffix: ", estilo clássico, elegante, atemporal" },
    ];

    try {
      const promises = variations.map(v => 
        generateInspirationImage(`${inspirePrompt}${v.promptSuffix}`)
      );
      
      const results = await Promise.allSettled(promises);

      const successfulResults = results
        .map((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            return {
              src: `data:image/jpeg;base64,${result.value}`,
              title: variations[index].title,
            };
          }
          return null;
        })
        .filter((result): result is GeneratedImage => result !== null);

      if (successfulResults.length === 0) {
        setError('Não foi possível gerar nenhuma imagem de inspiração. Tente um prompt diferente.');
      }
      
      setGeneratedImages(successfulResults);

    } catch (err: any) {
      setError(`Ocorreu um erro ao gerar as imagens: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [inspirePrompt]);
  
  const commonButtonClasses = "w-full flex items-center justify-center gap-3 bg-brand-gold hover:bg-yellow-300 text-brand-dark font-semibold py-3 px-6 rounded-md shadow-sm transition-all duration-300 transform hover:scale-[1.02] disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100";
  const commonTextAreaClasses = "w-full p-4 rounded-md border bg-brand-dark border-brand-gold/30 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition text-sm font-sans text-brand-light placeholder:text-brand-light/40";

  const renderTransformTab = () => (
    <div className="w-full space-y-6">
      <ImageUploader onImageUpload={handleImageUpload} currentImage={imagePayload?.data} />
      <textarea
        value={transformPrompt}
        onChange={(e) => setTransformPrompt(e.target.value)}
        placeholder="Descreva a transformação desejada... ex: 'Quero me ver com mechas balayage mel' ou 'Mostre diferentes volumes de extensão de cílios'"
        className={commonTextAreaClasses}
        rows={3}
      />
      <button onClick={handleTransformSubmit} disabled={isLoading || !imagePayload || !transformPrompt} className={commonButtonClasses}>
        <CameraIcon /> Gerar Minha Prévia
      </button>
    </div>
  );

  const renderInspireTab = () => (
     <div className="w-full space-y-6">
       <p className="text-center text-brand-light/70 text-sm">Não consegue decidir? Gere uma inspiração única!</p>
       <textarea value={inspirePrompt} onChange={(e) => setInspirePrompt(e.target.value)} placeholder="Descreva um look ou estilo de beleza... ex: 'Um penteado futurista cromado' ou 'Maquilhagem etérea de fada'" className={commonTextAreaClasses} rows={3}/>
      <button onClick={handleInspirationSubmit} disabled={isLoading || !inspirePrompt} className={commonButtonClasses}>
        <SparklesIcon /> Gerar Inspiração
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-dark font-sans">
      <Header />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-[#111] rounded-lg shadow-2xl shadow-black/30 border border-brand-gold/20 p-6 sm:p-8 space-y-8">
          <div className="flex justify-center border-b border-brand-light/20 pb-4">
            <div className="flex space-x-2 sm:space-x-4">
              <TabButton isActive={activeTab === 'transform'} onClick={() => handleTabChange('transform')}>
                <CameraIcon /> Transformação
              </TabButton>
              <TabButton isActive={activeTab === 'inspire'} onClick={() => handleTabChange('inspire')}>
                <SparklesIcon /> Inspiração
              </TabButton>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            {activeTab === 'transform' && renderTransformTab()}
            {activeTab === 'inspire' && renderInspireTab()}
          </div>

          {error && <p className="text-center text-red-400 bg-red-900/30 border border-red-400/50 p-3 rounded-md text-sm">{error}</p>}
        </div>

        {isLoading && <LoadingSpinner />}

        {!isLoading && generatedImages.length > 0 && (
          <div className="mt-12">
            <h2 className="text-4xl font-serif text-center text-brand-light mb-8">Seus Resultados</h2>
            <ResultsGrid images={generatedImages} originalImageSrc={activeTab === 'transform' ? imagePayload?.data : undefined} />
          </div>
        )}
      </main>
      <footer className="text-center p-4 mt-8 text-xs text-brand-light/50">
        Studio Luminous &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;