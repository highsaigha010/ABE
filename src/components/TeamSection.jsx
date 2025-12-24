import React from 'react';

const TeamSection = () => {
  const team = [
    {
      name: "Allen", 
      role: "Co-Founder & CEO",
      desc: "The Visionary. Focuses on building strategic partnerships and expanding ABE Events' reach.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Allen" 
    },
    {
      name: "Reggie", 
      role: "Co-Founder & CTO",
      desc: "The Architect. Ensures your payments are 100% secure with our proprietary Smart Escrow™ technology.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Reggie"
    },
    {
      name: "Jenny", 
      role: "Co-Founder & COO",
      // ETO YUNG UPDATE KAY JENNY:
      desc: "The Enforcer. Manages operations and rigorously vets vendors to ensure strict quality standards.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jenny"
    }
  ];

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 text-center">
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Meet the Team Behind <span className="text-indigo-600">ABE Events</span>
        </h2>
        <p className="text-gray-500 mb-12 max-w-2xl mx-auto">
          Built by Kapampangans, for Kapampangans. We are real people ensuring your event is safe and successful.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="w-24 h-24 mx-auto mb-6 bg-indigo-100 rounded-full overflow-hidden border-4 border-white shadow-sm">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
              <div className="text-indigo-600 font-bold text-sm mb-4 uppercase tracking-wider">{member.role}</div>
              <p className="text-gray-500 text-sm leading-relaxed">
                {member.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
