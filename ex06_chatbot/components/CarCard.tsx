import { carTags, won, type Car } from "@/lib/cars";

export function CarTags({ car }: { car: Car }) {
  return (
    <div className="tags">
      {carTags(car).map((t) => (
        <span key={t} className="tag">{t}</span>
      ))}
    </div>
  );
}

type Props = {
  car: Car;
  onOpen: (id: number) => void;
};

export default function CarCard({ car, onOpen }: Props) {
  const sold = car.status === "sold";
  const state = sold ? "판매완료" : "판매중";
  return (
    <article
      className={sold ? "card sold" : "card"}
      data-id={car.id}
      tabIndex={0}
      role="link"
      aria-label={`${car.name} ${won(car.price)}만원 ${state}`}
      onClick={() => onOpen(car.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(car.id);
        }
      }}
    >
      <div className="thumb">
        <img src={car.photo} alt={car.name} loading="lazy" />
        <span className={sold ? "badge sold" : "badge"}>{state}</span>
        {sold && <div className="soldmask">판매완료</div>}
      </div>
      <div className="body">
        <p className="title">{car.name}</p>
        <div className="price">{won(car.price)}<small> 만원</small></div>
        <CarTags car={car} />
      </div>
    </article>
  );
}
