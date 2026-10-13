import { Quote, Star } from 'lucide-react';

export default function TestimonialCard({ testimonial }) {
  return (
    <figure className="card card-hover flex h-full flex-col">
      <Quote className="h-7 w-7 text-frost" aria-hidden="true" />
      <div className="mt-4 flex gap-0.5" aria-label={`Rated ${testimonial.rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-line'}`}
            aria-hidden="true"
          />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-body">
        “{testimonial.comment}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ice text-sm font-bold text-primary">
          {String(testimonial.name || 'IK').charAt(0).toUpperCase()}
        </span>
        <span className="text-sm font-bold text-navy">
          {testimonial.name}
          {testimonial.service ? (
            <span className="block text-xs font-normal text-body">{testimonial.service}</span>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}
