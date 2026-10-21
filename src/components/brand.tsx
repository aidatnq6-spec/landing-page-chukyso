import Image from "next/image";
import logo from "../../public/brand/vitech-logo.png";
export default function Brand() {
  return (
    <Image
      src={logo}
      alt="VI-TECH"
      width={158}
      height={113}
      className="brand-image"
      preload
    />
  );
}
