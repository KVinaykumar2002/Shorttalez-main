import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from '@/lib/utils';

interface StaticCarouselProps {
  children: React.ReactNode[];
  className?: string;
}

export const StaticCarousel: React.FC<StaticCarouselProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={cn("relative", className)}>
      <Carousel
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
        <CarouselPrevious className="hidden" />
        <CarouselNext className="hidden" />
      </Carousel>
    </div>
  );
};

export default StaticCarousel;