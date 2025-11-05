import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { cn } from '@/lib/utils';

interface CarouselWithDotsProps {
  children: React.ReactNode[];
  className?: string;
  autoScroll?: boolean;
  autoScrollInterval?: number;
}

export const CarouselWithDots: React.FC<CarouselWithDotsProps> = ({
  children,
  className = '',
  autoScroll = false,
  autoScrollInterval = 3000,
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    if (!api || !autoScroll) {
      return;
    }

    const interval = setInterval(() => {
      const nextIndex = api.selectedScrollSnap() + 1;
      if (nextIndex >= api.scrollSnapList().length) {
        api.scrollTo(0);
      } else {
        api.scrollNext();
      }
    }, autoScrollInterval);

    return () => {
      clearInterval(interval);
    };
  }, [api, autoScroll, autoScrollInterval]);

  return (
    <div className={cn("relative", className)}>
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: false,
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {children.map((child, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-auto">
              {child}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default CarouselWithDots;