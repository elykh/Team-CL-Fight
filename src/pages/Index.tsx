import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@metagptx/web-sdk";

const client = createClient();

// ============ DONNÉES ÉQUIPEMENT ============
const EQUIPMENT = [
  {
    id: 1,
    name: "Gants de boxe",
    price: 45,
    images: ["/assets/gant-de-boxe.jpg"],
    description: "Gants en cuir synthétique haute qualité, rembourrage mousse HD. Idéal pour l'entraînement et le sparring.",
    sizes: ["8oz", "10oz", "12oz", "14oz", "16oz"],
  },
  {
    id: 2,
    name: "Protège-dents Standard",
    price: 12,
    images: ["/assets/protege-dents-classique.jpg"],
    description: "Protège-dents standard, protection fiable et confort optimal pour l'entraînement. Taille enfant disponible à 6€.",
    sizes: ["Enfant (6€)", "Junior", "Adulte"],
  },
  {
    id: 3,
    name: "Protège-dents Personnalisé",
    price: 55,
    images: ["/assets/protege-dents-personnalise.jpg"],
    description: "Protège-dents thermoformable personnalisé, protection maximale et ajustement parfait. Livré avec boîtier.",
    sizes: ["Junior", "Adulte"],
  },
  {
    id: 4,
    name: "Protège-tibias",
    price: 35,
    images: ["/assets/protege-tibia.jpg"],
    description: "Protection intégrale tibia et cou-de-pied, mousse EVA haute densité. Fixation velcro ajustable.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 5,
    name: "T-shirt du club",
    price: 35,
    images: ["/assets/tshirt-face.jpg", "/assets/tshirt-dos.jpg"],
    description: "T-shirt officiel Team Fight, coton premium avec logo du club. Coupe sport confortable.",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: 6,
    name: "Short de boxe",
    price: 35,
    images: ["/assets/short-de-boxe.jpg"],
    description: "Short satiné aux couleurs du club, coupe ample pour liberté de mouvement. Ceinture élastique.",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: 7,
    name: "Bandages (paire)",
    price: 8,
    images: ["/assets/bande.jpg"],
    description: "Bandages élastiques 4m, maintien optimal du poignet et des métacarpes. Fermeture velcro.",
    sizes: ["2.5m", "3.5m", "4m"],
  },
  {
    id: 8,
    name: "Pack Complet (Protège-tibias + Gants + Bandes)",
    price: 85,
    images: ["/assets/lot-complet.png"],
    description: "Pack complet : protège-tibias, gants de boxe et bandages. Économisez en prenant le pack !",
    sizes: ["S", "M", "L", "XL"],
  },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
}

// ============ SECTION HERO (Vidéo de fond) ============
function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const tryPlay = () => {
      if (isPlaying) return;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsPlaying(true)).catch(() => {});
      }
    };

    if (video.readyState >= 2) tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("playing", () => setIsPlaying(true));

    const retryOnInteraction = () => { if (!isPlaying) tryPlay(); };
    document.addEventListener("click", retryOnInteraction);
    document.addEventListener("touchstart", retryOnInteraction);
    document.addEventListener("scroll", retryOnInteraction);

    const interval = setInterval(() => {
      if (video.paused && video.readyState >= 2) tryPlay();
    }, 1000);

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      document.removeEventListener("click", retryOnInteraction);
      document.removeEventListener("touchstart", retryOnInteraction);
      document.removeEventListener("scroll", retryOnInteraction);
      clearInterval(interval);
    };
  }, [isPlaying]);

  const handleOverlayClick = () => {
    const video = videoRef.current;
    if (video && video.paused) {
      video.muted = true;
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <video
          ref={videoRef}
          autoPlay loop muted playsInline preload="auto"
          poster="/assets/hero/hero-action-1.jpeg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/assets/teamfight-bg.mp4" type="video/mp4" />
        </video>
        {!isPlaying && (
          <div className="absolute inset-0 z-[1] cursor-pointer" onClick={handleOverlayClick} />
        )}
        <div className="absolute inset-0 bg-black/30 z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a] z-[3]" />
      </div>
      <div className="relative z-[10] text-center px-4 flex flex-col items-center">
        <img src="/assets/team-cl-logo.png" alt="Team Fight Logo" className="w-64 md:w-96 h-auto mb-6" />
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light">
          Discipline. Force. Détermination. Rejoignez le club qui forge des champions.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <div className="h-1 w-16 bg-red-600 rounded" />
          <div className="h-1 w-16 bg-yellow-600 rounded" />
          <div className="h-1 w-16 bg-red-600 rounded" />
        </div>
      </div>
    </section>
  );
}

// ============ MÉDIAS DU DIAPORAMA ============
const CLUB_MEDIA = [
  { type: "image" as const, src: "/assets/hero/hero-group-photo.jpeg" },
  { type: "image" as const, src: "/assets/hero/hero-kids-lineup.jpeg" },
  { type: "image" as const, src: "/assets/hero/hero-kids-training.jpeg" },
  { type: "image" as const, src: "/assets/hero/hero-coach-sparring.jpeg" },
  { type: "video" as const, src: "/assets/hero/hero-video.mp4" },
  { type: "image" as const, src: "/assets/hero/hero-action-1.jpeg" },
  { type: "image" as const, src: "/assets/hero/hero-action-2.jpeg" },
  { type: "image" as const, src: "/assets/hero/hero-action-3.jpeg" },
];

// ============ SECTION À PROPOS (avec diaporama) ============
function AboutSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = (index: number) => setCurrentSlide(index);

  useEffect(() => {
    const currentMedia = CLUB_MEDIA[currentSlide];
    const delay = currentMedia.type === "video" ? 8000 : 4000;
    timerRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % CLUB_MEDIA.length);
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentSlide]);

  useEffect(() => {
    CLUB_MEDIA.forEach((media, index) => {
      if (media.type === "video") {
        const videoEl = videoRefs.current[index];
        if (videoEl) {
          videoEl.muted = true;
          videoEl.defaultMuted = true;
          videoEl.loop = true;
          videoEl.setAttribute("muted", "");
          videoEl.setAttribute("playsinline", "");
          if (index === currentSlide) {
            videoEl.currentTime = 0;
            const tryPlaySlide = () => {
              const p = videoEl.play();
              if (p !== undefined) p.catch(() => {});
            };
            tryPlaySlide();
            setTimeout(tryPlaySlide, 300);
          } else {
            videoEl.pause();
          }
        }
      }
    });
  }, [currentSlide]);

  useEffect(() => {
    const handleGlobalClick = () => {
      const currentMedia = CLUB_MEDIA[currentSlide];
      if (currentMedia.type === "video") {
        const videoEl = videoRefs.current[currentSlide];
        if (videoEl && videoEl.paused) {
          videoEl.muted = true;
          videoEl.play().catch(() => {});
        }
      }
    };
    document.addEventListener("click", handleGlobalClick);
    document.addEventListener("touchstart", handleGlobalClick);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
      document.removeEventListener("touchstart", handleGlobalClick);
    };
  }, [currentSlide]);

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold uppercase text-center mb-12 tracking-wide">
        Notre <span className="text-red-600">Club</span>
      </h2>
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="relative rounded-lg overflow-hidden shadow-2xl h-[350px]">
          {CLUB_MEDIA.map((media, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {media.type === "image" ? (
                <img src={media.src} alt={`Team Fight moment ${index + 1}`} className="w-full h-full object-cover" />
              ) : (
                <video
                  ref={(el) => { videoRefs.current[index] = el; }}
                  autoPlay muted playsInline loop preload="auto"
                  poster="/assets/hero/hero-action-1.jpeg"
                  className="w-full h-full object-cover"
                >
                  <source src={media.src} type="video/mp4" />
                </video>
              )}
            </div>
          ))}
          {CLUB_MEDIA[currentSlide].type === "video" && (
            <div className="absolute top-3 right-3 z-10 bg-red-600/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Vidéo
            </div>
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {CLUB_MEDIA.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-yellow-600 w-6" : "bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Photo ${index + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <p className="text-gray-300 leading-relaxed">
            Créé en 2019, <strong className="text-white">LA TEAM CL</strong> est un club dédié à l'enseignement et la pratique de diverses disciplines de combat : Boxe anglaise, Boxe thaïlandaise, MMA, Grappling, Jiu-Jitsu Brésilien, Lutte et disciplines associées.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Adaptés aux loisirs, débutants, intermédiaires, avancés et Pro. Que vous soyez débutant ou compétiteur, notre équipe de coachs diplômés vous accompagne dans votre progression.
          </p>
          <p className="text-gray-300 leading-relaxed">
            <strong className="text-yellow-600">Nos valeurs :</strong> Respect, Humilité, Maîtrise de soi, Se dépasser, Se surpasser.
          </p>
          <div className="grid grid-cols-1 gap-4 pt-4">
            <div className="bg-[#1a1a1a] p-4 rounded-lg border border-yellow-600/20">
              <p className="text-2xl font-bold text-yellow-600">100+</p>
              <p className="text-sm text-gray-400">Membres actifs</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ FORMULAIRE D'INSCRIPTION ============
function InscriptionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nom: "", prenom: "", email: "", telephone: "", niveau: "", message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await client.apiCall.invoke({
        url: "/api/v1/registration/submit",
        method: "POST",
        data: {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone,
          niveau: formData.niveau,
          message: formData.message,
        },
      });
      
      if (response?.data?.success) {
        setSubmitted(true);
        setFormData({ nom: "", prenom: "", email: "", telephone: "", niveau: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err?.data?.detail || err?.message || "Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[#1a1a1a] border-red-600/20 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl uppercase tracking-wide text-center">
          Formulaire d'<span className="text-red-600">Inscription</span>
        </CardTitle>
        <p className="text-gray-400 text-center text-sm">
          Remplissez ce formulaire pour rejoindre notre club
        </p>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🥊</div>
            <p className="text-green-500 text-lg font-semibold">Inscription envoyée avec succès !</p>
            <p className="text-gray-400 mt-2">Nous vous contacterons sous 48h.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" placeholder="Votre nom" required className="bg-[#0a0a0a] border-gray-700" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" placeholder="Votre prénom" required className="bg-[#0a0a0a] border-gray-700" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="votre@email.com" required className="bg-[#0a0a0a] border-gray-700" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" type="tel" placeholder="06 12 34 56 78" required className="bg-[#0a0a0a] border-gray-700" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="niveau">Niveau</Label>
              <Select required onValueChange={(val) => setFormData({...formData, niveau: val})}>
                <SelectTrigger className="bg-[#0a0a0a] border-gray-700">
                  <SelectValue placeholder="Sélectionnez votre niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debutant">Débutant</SelectItem>
                  <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                  <SelectItem value="avance">Avancé</SelectItem>
                  <SelectItem value="competition">Compétition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea id="message" placeholder="Informations supplémentaires..." className="bg-[#0a0a0a] border-gray-700" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
            </div>
            {error && (
              <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider py-6 disabled:opacity-50"
            >
              {loading ? "Envoi en cours..." : "S'inscrire"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// ============ MODAL PLANNING ============
function PlanningModal({ onClose }: { onClose: () => void }) {
  const schedule = [
    {
      time: "09H30 - 11H45",
      slots: [
        { day: "Lundi", activity: "Prépa Pro Salle" },
        { day: "Mardi", activity: "Prépa Pro Salle" },
        { day: "Mercredi", activity: "Prépa Pro Salle" },
        { day: "Jeudi", activity: "Prépa Pro Salle" },
        { day: "Vendredi", activity: "Prépa Pro Nautil" },
        { day: "Dimanche", activity: "Prépa Pro Piste" },
      ],
    },
    {
      time: "13H00 - 14H00",
      slots: [
        { day: "Mercredi", activity: "Girls Dojo" },
        { day: "Dimanche", activity: "Cours Spécial Femme" },
      ],
    },
    {
      time: "14H00 - 16H00",
      slots: [
        { day: "Mercredi", activity: "Compétiteurs / Pro Dojo" },
        { day: "Dimanche", activity: "Compétiteur Pro" },
      ],
    },
    {
      time: "16H30 - 17H30",
      slots: [
        { day: "Mercredi", activity: "Baby Boxing 5-8 ans" },
      ],
    },
    {
      time: "17H30 - 18H30",
      slots: [
        { day: "Mercredi", activity: "Enfants 8-13 ans" },
      ],
    },
    {
      time: "19H00 - 20H30",
      slots: [
        { day: "Lundi", activity: "Loisirs Boxe Anglaise/Thaï" },
        { day: "Mardi", activity: "Loisirs MMA Sol" },
        { day: "Mercredi", activity: "Loisirs MMA Sol" },
        { day: "Jeudi", activity: "Loisirs Boxe Anglaise/Thaï" },
        { day: "Vendredi", activity: "Prépa Pro" },
      ],
    },
    {
      time: "19H30 - 22H30",
      slots: [
        { day: "Lundi", activity: "Compétiteurs / Pro" },
        { day: "Mardi", activity: "Compétiteurs / Pro" },
        { day: "Mercredi", activity: "Compétiteurs / Pro" },
        { day: "Jeudi", activity: "Compétiteurs / Pro" },
        { day: "Vendredi", activity: "Compétiteurs / Pro" },
      ],
    },
  ];

  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Dimanche"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0a0a0a] border border-gray-700 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-wide">
            Planning <span className="text-red-600">2025-2026</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors">
            ✕
          </button>
        </div>
        <p className="text-gray-400 mb-6 text-center">Retrouvez nos horaires d'entraînement pour la saison</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-red-600/20">
                <th className="border border-gray-700 px-3 py-3 text-left text-yellow-600 font-bold uppercase text-xs">Horaires</th>
                {days.map((day) => (
                  <th key={day} className="border border-gray-700 px-3 py-3 text-center text-white font-bold uppercase text-xs">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#111111]"}>
                  <td className="border border-gray-700 px-3 py-3 text-yellow-600 font-semibold whitespace-nowrap text-xs">{row.time}</td>
                  {days.map((day) => {
                    const slot = row.slots.find((s) => s.day === day);
                    return (
                      <td key={day} className="border border-gray-700 px-2 py-3 text-center">
                        {slot ? (
                          <span className="text-gray-200 text-xs leading-tight">{slot.activity}</span>
                        ) : (
                          <span className="text-gray-700">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============ MODAL BOUTIQUE (Shop) ============
function ShopModal({ onClose }: { onClose: () => void }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<typeof EQUIPMENT[0] | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const addToCart = (product: typeof EQUIPMENT[0], size: string) => {
    let itemPrice = product.price;
    if (product.id === 2 && size.toLowerCase().includes("enfant")) {
      itemPrice = 6;
    }
    const existing = cart.find(item => item.id === product.id && item.size === size);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: itemPrice, quantity: 1, size }]);
    }
    setSelectedProduct(null);
    setSelectedSize("");
    setCurrentImageIndex(0);
  };

  const removeFromCart = (id: number, size: string) => {
    setCart(cart.filter(item => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
    } else {
      setCart(cart.map(item =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      ));
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nom = (form.elements.namedItem("order-nom") as HTMLInputElement)?.value || "";
    const email = (form.elements.namedItem("order-email") as HTMLInputElement)?.value || "";
    const tel = (form.elements.namedItem("order-tel") as HTMLInputElement)?.value || "";

    setOrderLoading(true);
    setOrderError("");

    try {
      const response = await client.apiCall.invoke({
        url: "/api/v1/sumup/create_checkout",
        method: "POST",
        data: {
          items: cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
          })),
          total: total,
          customer_name: nom,
          customer_email: email,
          customer_phone: tel,
        },
      });

      if (response?.data?.checkout_url) {
        window.open(response.data.checkout_url, "_blank");
        setOrderSubmitted(true);
        setCart([]);
        setTimeout(() => {
          setOrderSubmitted(false);
          setShowCart(false);
        }, 5000);
      } else {
        setOrderError("Impossible de créer le lien de paiement. Veuillez réessayer.");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      const detail = err?.data?.detail || err?.message || "";
      if (detail.includes("503") || detail.includes("not configured") || detail.includes("pas encore activé")) {
        setOrderError("Le paiement en ligne n'est pas encore disponible. Contactez-nous au 07 45 60 09 14.");
      } else {
        setOrderError(detail || "Erreur lors de la création du paiement. Veuillez réessayer.");
      }
    } finally {
      setOrderLoading(false);
    }
  };

  const renderContent = () => {
    if (orderSubmitted) {
      return (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-green-500 text-xl font-semibold">Commande envoyée avec succès !</p>
          <p className="text-gray-400 mt-2">Votre équipement sera prêt sous 5 jours ouvrés.</p>
        </div>
      );
    }

    if (showCart) {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold uppercase">
              Mon <span className="text-yellow-600">Panier</span> ({cartCount})
            </h3>
            <Button variant="outline" className="border-gray-700" onClick={() => setShowCart(false)}>
              ← Continuer les achats
            </Button>
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Votre panier est vide</p>
          ) : (
            <form onSubmit={handleOrder} className="space-y-4">
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={`${item.id}-${item.size}`} className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-gray-800">
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{item.name}</p>
                      <p className="text-gray-400 text-xs">Taille: {item.size}</p>
                    </div>
                    <p className="text-yellow-600 font-semibold text-sm">{item.price}€</p>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="outline" size="sm" className="h-7 w-7 p-0 border-gray-700" onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}>-</Button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <Button type="button" variant="outline" size="sm" className="h-7 w-7 p-0 border-gray-700" onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}>+</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400 text-lg">Total :</span>
                  <span className="text-3xl font-bold text-yellow-600">{total}€</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order-nom">Nom complet</Label>
                  <Input id="order-nom" placeholder="Votre nom" required className="bg-[#0a0a0a] border-gray-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order-email">Email</Label>
                  <Input id="order-email" type="email" placeholder="votre@email.com" required className="bg-[#0a0a0a] border-gray-700" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-tel">Téléphone</Label>
                <Input id="order-tel" type="tel" placeholder="07 45 60 09 14" required className="bg-[#0a0a0a] border-gray-700" />
              </div>

              {orderError && (
                <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{orderError}</p>
                </div>
              )}

              <Button type="submit" disabled={orderLoading} className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold uppercase tracking-wider py-6 disabled:opacity-50">
                {orderLoading ? "Redirection vers le paiement..." : `Valider le panier (${total}€)`}
              </Button>
            </form>
          )}
        </div>
      );
    }

    if (selectedProduct) {
      return (
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" className="border-gray-700 mb-6" onClick={() => { setSelectedProduct(null); setSelectedSize(""); setCurrentImageIndex(0); }}>
            ← Retour aux produits
          </Button>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="aspect-square rounded-lg overflow-hidden bg-[#1a1a1a]">
                <img src={selectedProduct.images[currentImageIndex]} alt={selectedProduct.name} className="w-full h-full object-cover" />
              </div>
              {selectedProduct.images.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                        currentImageIndex === idx ? "border-yellow-600" : "border-gray-700 hover:border-gray-500"
                      }`}
                    >
                      <img src={img} alt={`${selectedProduct.name} vue ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <div className="flex items-center gap-1 ml-2">
                    <span className="text-gray-500 text-xs">{currentImageIndex === 0 ? "Face" : "Dos"}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">{selectedProduct.name}</h3>
              <p className="text-3xl font-bold text-yellow-600">{selectedProduct.price}€</p>
              <p className="text-gray-300 leading-relaxed">{selectedProduct.description}</p>
              <div className="space-y-2">
                <Label>Taille</Label>
                <Select onValueChange={setSelectedSize}>
                  <SelectTrigger className="bg-[#0a0a0a] border-gray-700">
                    <SelectValue placeholder="Choisir une taille" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProduct.sizes.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => selectedSize && addToCart(selectedProduct, selectedSize)}
                disabled={!selectedSize}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold uppercase tracking-wider py-5 disabled:opacity-50"
              >
                Ajouter au panier
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Grille de produits
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-400">Équipez-vous avec du matériel de qualité aux couleurs du club</p>
          <Button variant="outline" className="border-yellow-600/50 text-yellow-600 hover:bg-yellow-600/10 relative" onClick={() => setShowCart(true)}>
            🛒 Panier
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
            )}
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {EQUIPMENT.map(product => (
            <div
              key={product.id}
              className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden cursor-pointer group hover:border-yellow-600/50 transition-colors"
              onClick={() => { setSelectedProduct(product); setCurrentImageIndex(0); }}
            >
              <div className="aspect-square overflow-hidden">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3">
                <h4 className="text-white font-medium text-sm truncate">{product.name}</h4>
                <p className="text-yellow-600 font-bold mt-1">{product.price}€</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0a0a0a] border border-gray-700 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-wide">
            <span className="text-yellow-600">Shop</span> Équipement
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors">
            ✕
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

// ============ LIENS RÉSEAUX SOCIAUX ============
function SocialLinks() {
  return (
    <div className="flex items-center justify-center gap-6">
      {/* Instagram */}
      <a href="https://www.instagram.com/clubfightteam?igsh=MWs2aDJvNWppNXlwMQ==" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 transition-transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
        <span className="text-gray-400 text-xs hover:text-pink-500 transition-colors">Instagram</span>
      </a>

      {/* TikTok */}
      <a href="https://www.tiktok.com/@cl.fight" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 transition-transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-white">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.88 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.6a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.4a8.16 8.16 0 0 0 4.76 1.52V7.47a4.85 4.85 0 0 1-1-.78z" />
        </svg>
        <span className="text-gray-400 text-xs hover:text-white transition-colors">TikTok</span>
      </a>

      {/* Facebook */}
      <a href="https://www.facebook.com/najib.cl.5" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 transition-transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span className="text-gray-400 text-xs hover:text-blue-500 transition-colors">Facebook</span>
      </a>
    </div>
  );
}

// ============ COMPOSANT PRINCIPAL ============
export default function Index() {
  const [showPlanning, setShowPlanning] = useState(false);
  const [showShop, setShowShop] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation en haut à droite */}
      <nav className="fixed top-4 right-4 z-40 flex gap-3">
        <button
          onClick={() => setShowPlanning(true)}
          className="flex items-center gap-2 bg-[#1a1a1a]/90 backdrop-blur-sm border border-gray-700 hover:border-red-600 rounded-full px-4 py-2 transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">Planning</span>
        </button>
        <button
          onClick={() => setShowShop(true)}
          className="flex items-center gap-2 bg-[#1a1a1a]/90 backdrop-blur-sm border border-gray-700 hover:border-yellow-600 rounded-full px-4 py-2 transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">Shop</span>
        </button>
      </nav>

      <HeroSection />
      <AboutSection />

      {/* Section Inscription */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold uppercase text-center mb-12 tracking-wide">
          Rejoignez-<span className="text-red-600">nous</span>
        </h2>
        <InscriptionForm />
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4 text-center space-y-4">
        <SocialLinks />
        <p className="text-gray-500 text-sm">© 2026 Team Fight — Tous droits réservés</p>
        <p className="text-gray-600 text-xs">107 avenue de la République, 77340 Pontault-Combault</p>
        <p className="text-gray-600 text-xs">clubfight.teamcl@gmail.com | 07 45 60 09 14</p>
      </footer>

      {/* Modals */}
      {showPlanning && <PlanningModal onClose={() => setShowPlanning(false)} />}
      {showShop && <ShopModal onClose={() => setShowShop(false)} />}
    </div>
  );
}
