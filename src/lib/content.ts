export const navigation = [
  { href: "/", label: "Home" },
  { href: "/plans", label: "Our plans" },
  { href: "/why-choose-us", label: "Why choose us" },
  { href: "/faq", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];

export const coverageOptions = ["Final Expense", "Burial Insurance", "Cremation Plan", "Other"] as const;
export const coverageLabels: Record<string, string> = { "Final Expense": "Final Expense Coverage", "Burial Insurance": "Burial Insurance", "Cremation Plan": "Cremation Plan", Other: "Other" };

export const plans = [
  { id: "level", name: "Level Benefit", tag: "A fresh start, from day one", icon: "shield", description: "For people in generally good health who want protection that can begin when their policy takes effect.", features: ["Full benefits from the effective date", "Predictable, level premiums", "Health questions, often no medical exam"], note: "Approval and effective dates depend on the carrier and policy.", fit: "Generally favorable health history", benefit: "Full coverage from the policy effective date", health: "Health questions typically required", cost: "Depends on age, health, and coverage" },
  { id: "graded", name: "Graded Benefit", tag: "More paths to protection", icon: "heart", description: "An option worth exploring when a health condition makes immediate full coverage harder to qualify for.", features: ["Benefits increase over an initial period", "Premiums remain level", "Options for a range of health histories"], note: "Benefit schedules and waiting periods vary by policy.", fit: "Some pre-existing health conditions", benefit: "Benefits phase in over the first policy years", health: "Some health questions may apply", cost: "Reflects health history and coverage" },
  { id: "guaranteed", name: "Guaranteed Issue", tag: "Another way forward", icon: "", description: "For people who may not qualify for other options, with fewer health-related application requirements.", features: ["Often no health questions or exam", "A waiting period usually applies", "Support for your family’s final expenses"], note: "Age and state restrictions apply. Premiums may be higher.", fit: "People unable to qualify for other plans", benefit: "A waiting period usually applies to full benefits", health: "Often no health questions or medical exam", cost: "Typically higher for comparable coverage" },
];

export const faqs = [
  { question: "What is final expense insurance?", answer: "Final expense insurance is a type of whole life insurance intended to help pay for end-of-life costs, such as funeral services, burial or cremation, and certain remaining bills. Coverage amounts are typically smaller than traditional life insurance and can be chosen with your monthly budget in mind.", category: "The basics" },
  { question: "Who is final expense insurance designed for?", answer: "This coverage is commonly considered by adults in their 50s, 60s, 70s, and beyond who want to help protect loved ones from unexpected costs. Age limits, health requirements, and availability depend on the carrier, plan, and state.", category: "The basics" },
  { question: "Do I need a medical exam to qualify?", answer: "Many final expense plans use simplified underwriting: you answer health questions without completing a full medical exam. Some guaranteed issue plans do not ask health questions, but they may have waiting periods and higher premiums. A licensed agent can explain which options may be available to you.", category: "Coverage & eligibility" },
  { question: "How much coverage should I consider?", answer: "Consider funeral, burial or cremation costs in your area, as well as any remaining bills you would like to help your family cover. Balance those needs with a premium you can comfortably afford over time. A licensed agent can help you compare coverage amounts and explain policy limits.", category: "Coverage & eligibility" },
  { question: "How does TheSafeQuote work?", answer: "Complete our short quote request form. Your information is used to connect you with licensed agents and partner companies that offer final expense insurance. An agent may contact you by phone, text, or email to discuss your goals, explain your options, and provide personalized quotes.", category: "Getting a quote" },
  { question: "Am I obligated to buy a policy?", answer: "No. Requesting information or a quote through TheSafeQuote does not obligate you to purchase coverage. Take time to review your options, ask questions, and decide what is right for your family.", category: "Getting a quote" },
  { question: "How are my personal details used?", answer: "Your information is used to provide quotes and connect you with licensed agents and partner companies. Our Privacy Policy explains how information is collected, used, and shared. Before submitting, you can review our Terms & Conditions and TCPA disclosure on the Legal page.", category: "Getting a quote" },
  { question: "Can I change or cancel my policy later?", answer: "Cancellation rights, policy changes, cash values, and any surrender charges depend on your carrier and policy. Review the policy documents and ask your licensed agent to explain those details before you enroll.", category: "Coverage & eligibility" },
  { question: "What is a waiting period?", answer: "Some policies limit the benefit for certain causes of death during the first policy years. The length of that period and the amount paid during it depend on the policy. Ask your agent when full benefits begin and what benefits apply before that date.", category: "Coverage & eligibility" },
  { question: "What should I have ready for a quote conversation?", answer: "It helps to know your age, basic health history, the amount of coverage you are considering, and a comfortable monthly budget. You can also prepare questions about premiums, waiting periods, beneficiaries, and the policy’s terms.", category: "Getting a quote" },
];

export const benefits = [
  { title: "Real people. Clear answers.", text: "Understand your options with straightforward explanations from licensed insurance professionals.", icon: "message" },
  { title: "Your budget comes first.", text: "Explore coverage that fits what you can comfortably afford, with the details explained upfront.", icon: "wallet" },
  { title: "Room to make your decision.", text: "Ask every question. Consider your options. A quote comes with no obligation to enroll.", icon: "heart" },
  { title: "More options to explore.", text: "Compare available plans from multiple carriers instead of being limited to one option.", icon: "layers" },
  { title: "A little less on their shoulders.", text: "Plan ahead to help your loved ones with funeral expenses and other remaining bills.", icon: "family" },
  { title: "Respect for your time.", text: "Start with a simple online request and discuss your needs in a focused conversation.", icon: "clock" },
];
