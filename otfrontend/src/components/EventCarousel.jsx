import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react'; 
import Autoplay from 'embla-carousel-autoplay'; 
import EventCard from './EventCard';
import { ChevronLeft, ChevronRight } from 'lucide-react'; 

// --- 輪播主體 ---
export default function EventCarousel({ slides, options }) {
    
    //步驟 2.1: 定義 Autoplay 插件選項
    const autoplayOptions = {
        // 延遲時間設為 1000 毫秒 (1 秒)
        delay: 3000, 
        // 互動後停止輪播，如果希望永遠不停止，可以設為 false
        stopOnInteraction: false, 
        // 鼠標移入時停止輪播，移出後恢復
        stopOnMouseEnter: true,
    };

    //步驟 2.2: 將 Autoplay 插件和選項傳入 useEmblaCarousel
    // useEmblaCarousel 的第二個參數是插件陣列 [Autoplay(autoplayOptions)]
    const [emblaRef, emblaApi] = useEmblaCarousel(options, [Autoplay(autoplayOptions)]);
    
    // 將 ArrowButton 定義移入 EventCarousel 函式內，解決 ReferenceError
    const ArrowButton = ({ children, onClick, disabled, className }) => (
        <button
            className={`absolute top-1/2 -translate-y-1/2 z-10 bg-accent hover:bg-accent text-bg p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition ${className}`}
            onClick={onClick}
            disabled={disabled}
            type="button"
        >
            {children}
        </button>
    );

    
    // 狀態追蹤邏輯保持不變
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback((emblaApi) => {
        setPrevBtnDisabled(!emblaApi.canScrollPrev());
        setNextBtnDisabled(!emblaApi.canScrollNext());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        onSelect(emblaApi);
        
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect); 
        
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        }
    }, [emblaApi, onSelect]); 

    return (
        <div className="relative">
            
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex"> 
                    {slides.map((event, index) => (
                        <div 
                            key={index} 
                            className="flex-shrink-0 w-full sm:w-1/2 md:w-1/4 px-2"
                        >
                            <EventCard {...event} />
                        </div>
                    ))}
                </div>
            </div>

            <ArrowButton 
                onClick={scrollPrev} 
                disabled={prevBtnDisabled} 
                className="left-4"
            >
                <ChevronLeft size={24} />
            </ArrowButton>

            <ArrowButton 
                onClick={scrollNext} 
                disabled={nextBtnDisabled} 
                className="right-4"
            >
                <ChevronRight size={24} />
            </ArrowButton>

        </div>
    );
}