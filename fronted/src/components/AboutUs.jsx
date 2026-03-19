import React from 'react';

const AboutUs = () => {
  const aboutCards = [
    {
      title: "Our Story",
      description: "HouseKenya was founded to connect travelers with authentic Kenyan homes. From bustling Nairobi apartments to serene coastal villas, we bring you the real Kenya experience.",
      icon: "🏠",
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Why Choose Us",
      description: "Handpicked properties, verified hosts, secure payments, and 24/7 local support. Your perfect stay is guaranteed.",
      icon: "✅",
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Locations Covered",
      description: "Nairobi, Mombasa, Kisumu, Nakuru, Naivasha, Diani, and more. Explore every corner of beautiful Kenya.",
      icon: "📍",
      color: "from-purple-500 to-violet-600"
    },
    {
      title: "Customer Support",
      description: "Our local team is available anytime. WhatsApp, email, or phone - we're here to make your trip unforgettable.",
      icon: "📞",
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            About HouseKenya
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted partner for premium vacation rentals across Kenya
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {aboutCards.map((card, index) => (
            <div key={index} className="group">
              <div className={`bg-gradient-to-br ${card.color} p-8 rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:-translate-y-2 h-full`}>
                <div className="text-4xl mb-6">{card.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{card.title}</h3>
                <p className="text-indigo-100 leading-relaxed">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

