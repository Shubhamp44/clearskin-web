import { Link } from "react-router-dom";
import {
  Leaf,
  Heart,
  ShieldCheck,
  Sparkles,
  Droplets,
  ArrowRight,
  CheckCircle2,
  Truck,
  Users,
} from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Leaf,
      title: "Thoughtful Ingredients",
      description:
        "We focus on skincare essentials with carefully selected ingredients for your everyday routine.",
    },
    {
      icon: ShieldCheck,
      title: "Quality First",
      description:
        "We believe skincare should be simple, reliable, and focused on quality.",
    },
    {
      icon: Heart,
      title: "Care for Every Skin",
      description:
        "Our goal is to help everyone build a skincare routine that feels right for them.",
    },
  ];

  const benefits = [
    "Everyday skincare essentials",
    "Simple and easy skincare routines",
    "A variety of products for different needs",
    "Convenient online shopping experience",
  ];

  return (
    <main className="min-h-screen bg-[#fbfcf8] text-stone-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#e8f1e5]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-800">
              <Leaf size={16} />
              Welcome to Clear Skin
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-stone-900 sm:text-5xl lg:text-6xl">
              Your Skin.
              <br />
              Your Care.
              <br />
              <span className="text-emerald-800">
                Your Confidence.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-stone-600 sm:text-lg">
              We believe skincare should feel simple, enjoyable, and
              personal. Clear Skin brings your everyday skincare
              essentials together in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-900"
              >
                Explore Products <ArrowRight size={18} />
              </Link>

              <Link
                to="/"
                className="rounded-xl border border-emerald-800 px-6 py-3.5 font-semibold text-emerald-900 transition hover:bg-white"
              >
                Back to Home
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-emerald-200/70 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-amber-100 blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/80 bg-white/70 p-4 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85"
                alt="Skincare products arranged for a daily skincare routine"
                className="h-[350px] w-full rounded-[1.5rem] object-cover sm:h-[420px]"
              />

              <div className="absolute bottom-8 left-8 right-8 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-100 p-3 text-emerald-800">
                    <Sparkles size={22} />
                  </span>
                  <div>
                    <p className="font-bold text-stone-900">
                      Make Time for Your Skin
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      Small steps. Everyday care.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-20">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85"
            alt="Relaxing skincare and facial care"
            className="h-80 w-full rounded-3xl object-cover shadow-md sm:h-[420px]"
          />

          <div className="absolute -bottom-5 right-4 rounded-2xl bg-white p-4 shadow-lg sm:right-8">
            <p className="font-bold text-emerald-800">
              Skincare Made Simple
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Your daily self-care ritual
            </p>
          </div>
        </div>

        <div className="pt-5 md:pt-0">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
            Our Story
          </p>

          <h2 className="mt-4 text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
            Beauty begins with caring for yourself.
          </h2>

          <p className="mt-5 leading-8 text-stone-600">
            At Clear Skin, we want to make discovering skincare products
            easier. From cleansing and hydration to everyday sun
            protection, our store brings together essentials that help
            you create a routine suited to your needs.
          </p>

          <p className="mt-4 leading-8 text-stone-600">
            We believe you do not need a complicated routine to care
            for your skin. Start with the basics, stay consistent, and
            make self-care a part of your day.
          </p>

          <div className="mt-6 space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <CheckCircle2
                  size={21}
                  className="mt-0.5 shrink-0 text-emerald-700"
                />
                <span className="text-stone-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              What We Believe
            </p>
            <h2 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">
              Our Mission & Vision
            </h2>
            <p className="mt-4 leading-7 text-stone-600">
              Helping make everyday skincare easier to understand
              and more enjoyable.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-[#edf5e9] p-7 sm:p-10">
              <div className="mb-5 inline-flex rounded-2xl bg-white p-4 text-emerald-800">
                <Heart size={28} />
              </div>
              <h3 className="text-2xl font-bold text-stone-900">
                Our Mission
              </h3>
              <p className="mt-4 leading-8 text-stone-600">
                To provide a convenient place to discover everyday
                skincare essentials and make personal care a simple
                part of daily life.
              </p>
            </div>

            <div className="rounded-3xl bg-[#faf0e6] p-7 sm:p-10">
              <div className="mb-5 inline-flex rounded-2xl bg-white p-4 text-amber-800">
                <Sparkles size={28} />
              </div>
              <h3 className="text-2xl font-bold text-stone-900">
                Our Vision
              </h3>
              <p className="mt-4 leading-8 text-stone-600">
                To create a trusted online skincare destination where
                people can explore products, learn about their options,
                and feel confident about their self-care routine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
            The Clear Skin Promise
          </p>
          <h2 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">
            What Matters to Us
          </h2>
          <p className="mt-4 leading-7 text-stone-600">
            The principles behind your everyday skincare shopping experience.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <div
                key={value.title}
                className="rounded-3xl border border-stone-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-5 inline-flex rounded-2xl bg-emerald-50 p-4 text-emerald-800">
                  <Icon size={28} strokeWidth={1.7} />
                </div>

                <h3 className="text-xl font-bold text-stone-900">
                  {value.title}
                </h3>

                <p className="mt-3 leading-7 text-stone-600">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-[#e8f1e5] py-16">
        <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
            Find Your Routine
          </p>

          <h2 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">
            Everything Your Routine Needs
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-stone-600">
            Explore skincare essentials for cleansing, hydration,
            nourishment, and everyday sun protection.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {[
              { name: "Face Wash", category: "Face Wash", icon: Droplets },
              { name: "Serums", category: "Serums", icon: Sparkles },
              { name: "Moisturizers", category: "Moisturizers", icon: Leaf },
              { name: "Body Wash", category: "Body Wash", icon: Droplets },
              { name: "Sunscreen", category: "Sunscreen", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={`/products?category=${encodeURIComponent(item.category)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-3 font-medium text-emerald-900 transition hover:bg-emerald-800 hover:text-white"
                >
                  <Icon size={17} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Shopping Benefits */}
      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-12 sm:grid-cols-3 sm:px-8">
        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <span className="rounded-xl bg-emerald-50 p-3 text-emerald-800">
            <Truck size={25} />
          </span>
          <div>
            <h3 className="font-bold">Free Shipping</h3>
            <p className="mt-1 text-sm text-stone-500">
              On orders above ₹999
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <span className="rounded-xl bg-emerald-50 p-3 text-emerald-800">
            <ShieldCheck size={25} />
          </span>
          <div>
            <h3 className="font-bold">Secure Shopping</h3>
            <p className="mt-1 text-sm text-stone-500">
              A convenient online experience
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <span className="rounded-xl bg-emerald-50 p-3 text-emerald-800">
            <Users size={25} />
          </span>
          <div>
            <h3 className="font-bold">Customer Care</h3>
            <p className="mt-1 text-sm text-stone-500">
              Here to help with your shopping
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-16 sm:px-8 md:pb-20">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-emerald-900 px-6 py-12 text-center sm:px-12 sm:py-16">
          <Leaf className="mx-auto text-emerald-200" size={35} />

          <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            Your Skincare Journey Starts Here
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-emerald-100">
            Explore our collection and find the everyday essentials
            that fit your skincare routine.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-emerald-900 transition hover:bg-emerald-50"
          >
            Shop Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}