export function AbstractArt({compact=false}:{compact?:boolean}) {
  return <div className={`abstract-art${compact?" abstract-art--compact":""}`} aria-hidden="true">
    <div className="abstract-art__wash" />
    <div className="abstract-art__orbit abstract-art__orbit--one" />
    <div className="abstract-art__orbit abstract-art__orbit--two" />
    <div className="abstract-art__axis" />
    <div className="abstract-art__disc" />
    <span className="abstract-art__caption">40.7° N / 74.0° W</span>
  </div>;
}
