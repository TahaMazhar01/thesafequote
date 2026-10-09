import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { blogSchema, newBlock } from "../src/lib/blog";

const stories = [
  {
    title: "A calmer way to prepare for a life insurance conversation",
    slug: "prepare-for-a-life-insurance-conversation",
    excerpt: "A little preparation can help you ask clearer questions and leave a quote conversation with information you can actually use.",
    category: "Coverage basics", image: "notebook", alt: "A pen resting on an open notebook", photographer: "Thomas Martinsen", file: "Pen_on_a_notebook_(Unsplash).jpg",
    sections: [
      ["paragraph", "An insurance conversation is easier when you know what you want to understand. You do not need perfect answers before you begin. A short note about your priorities can give the discussion a useful starting point and help you avoid making a rushed decision."],
      ["h2", "Start with the people you want to support"],
      ["paragraph", "Think about who might need financial support if you were no longer here. Write down what you hope a policy would help them manage. Your concern might be a final bill or a period of lost household income. These are different needs. Naming yours helps you explain the purpose of the conversation without choosing a product too early."],
      ["h2", "Choose a comfortable spending boundary"],
      ["paragraph", "Look at your normal monthly commitments before discussing a premium. Use a figure you could manage during an ordinary month rather than an unusually good one. Ask what could change over time. A payment that seems manageable today deserves another look if its future cost is unclear."],
      ["h2", "Bring questions that invite clear answers"],
      ["paragraph", "Ask the person explaining the policy to show you where its key terms appear in writing. Find out how long coverage lasts and whether premiums can change. Ask about exclusions and any waiting period. The NAIC encourages consumers to understand the policy and consider their needs before buying. Take time to connect each answer to your own reason for seeking coverage."],
      ["h2", "Leave room to read and reflect"],
      ["paragraph", "Keep the written information together after the conversation. Note anything that was not clear and ask a follow up question before deciding. A helpful explanation should still make sense when you read it later. You can also discuss the practical details with someone you trust. This article offers general education. The actual policy terms determine what a particular plan provides."],
      ["link", "Read the NAIC life insurance consumer guide", "https://content.naic.org/consumer/life-insurance.htm"],
    ],
  },
  {
    title: "Build a family planning folder that people can find",
    slug: "build-a-family-planning-folder",
    excerpt: "Make important information easier to locate with a simple folder and a clear plan for keeping it current.",
    category: "Family planning", image: "home", alt: "A welcoming white house surrounded by greenery", photographer: "Gus Ruballo", file: "Cozy_white_house_(Unsplash).jpg",
    sections: [
      ["paragraph", "A useful planning folder does not need to be elaborate. Its purpose is to help a trusted person find the right information when everyday routines are interrupted. Start small. A clear index and a reliable location are often more useful than a thick collection of papers that nobody knows exists."],
      ["h2", "Make a map before collecting documents"],
      ["paragraph", "Use the first page to explain what is inside and where other records are kept. You might include the name of an insurance provider and a customer service number. Keep a note of the location of original documents rather than assuming every original belongs in one folder. Separate practical notes from documents that have a formal legal purpose."],
      ["h2", "Write for the person who will use it"],
      ["paragraph", "Avoid abbreviations that only you understand. Explain which contact handles which question. A short sentence such as call this office about the policy is more useful than an unexplained telephone number. Read the folder as if you were seeing it for the first time. Any step that depends on your memory needs a little more explanation."],
      ["h2", "Protect the information inside"],
      ["paragraph", "Choose a secure storage location that fits the sensitivity of the records. Do not place passwords in a shared household document or send account details through a casual group message. Tell a trusted person how to locate the folder through an appropriate access arrangement. Access should be intentional rather than available to anyone who happens to find a link."],
      ["h2", "Keep the habit easy to repeat"],
      ["paragraph", "Pick a regular time to review the folder and add a date to the first page. Replace outdated contact information when it changes. Remove duplicate notes that could create confusion. You do not need to finish everything in one afternoon. Begin with the records someone would need first and improve the folder over time. Questions about legal authority or access should go to a qualified professional who understands your circumstances."],
      ["link", "Explore life insurance information from the NAIC", "https://content.naic.org/insurance-topics/life-insurance"],
    ],
  },
  {
    title: "How to begin a thoughtful conversation about final wishes",
    slug: "a-thoughtful-conversation-about-final-wishes",
    excerpt: "An unhurried conversation can help your family understand what matters to you without trying to resolve everything at once.",
    category: "Family conversations", image: "coffee", alt: "Coffee with latte art in a blue cup", photographer: "rawpixel.com", file: "Blue_coffee_cup_(Unsplash).jpg",
    sections: [
      ["paragraph", "Some family conversations are difficult because they matter so much. Talking about final wishes can feel uncomfortable even when everyone has good intentions. A gentle beginning gives people time to listen. The goal of the first conversation can simply be to understand each other a little better."],
      ["h2", "Choose an ordinary quiet moment"],
      ["paragraph", "Try to begin when nobody is rushing to leave or dealing with an immediate problem. Explain why the conversation matters to you. You could say that you want your family to have fewer unanswered questions in the future. Ask whether this is a comfortable time to talk and respect the answer. A planned conversation is easier to approach than an unexpected announcement."],
      ["h2", "Share what matters before discussing details"],
      ["paragraph", "Begin with a value or preference rather than a long set of instructions. Perhaps you want a simple gathering. Perhaps a particular tradition is meaningful to you. Explain the reason behind the preference so your family can understand it. Leave room for questions. Listening is part of planning too."],
      ["h2", "Separate wishes from decisions that need research"],
      ["paragraph", "A preference does not settle every practical question. Some choices may depend on cost or availability. Keep a short list of matters that need more information and agree who will look into them. Avoid putting pressure on one person to remember the whole discussion. A shared summary can make the next conversation more focused."],
      ["h2", "Finish with one manageable next step"],
      ["paragraph", "You might agree to write down your preferences or arrange another conversation. Ask whether the summary reflects what everyone heard. Store it where the appropriate person can find it and review it when your wishes change. An informal note is not a substitute for documents required by law. If you need instructions to have legal effect seek advice that applies to your location. There is no need to force a complete plan into a single evening."],
      ["link", "Read the FTC guide to choosing a funeral provider", "https://consumer.ftc.gov/articles/choosing-funeral-provider"],
    ],
  },
  {
    title: "Compare funeral estimates with a clear head",
    slug: "compare-funeral-estimates-with-a-clear-head",
    excerpt: "A simple comparison sheet can help you understand what each estimate includes and which questions still need an answer.",
    category: "Practical guidance", image: "flowers", alt: "A softly lit arrangement of flowers", photographer: "Alexandra Gorn", file: "Flowers_1_(Unsplash).jpg",
    sections: [
      ["paragraph", "Comparing funeral arrangements can be emotionally tiring. It can also be hard to compare prices when providers describe their services differently. Give yourself a simple structure before looking at totals. A written comparison helps you focus on the arrangements you want and the information you still need."],
      ["h2", "Describe the same arrangement each time"],
      ["paragraph", "Prepare a short description of the services you are considering. Use it when contacting each provider so the estimates address the same needs. If a provider suggests an additional service ask how it changes the estimate. Keep optional choices separate in your notes until you decide whether they belong in your plan."],
      ["h2", "Ask what the quoted price includes"],
      ["paragraph", "Ask for an explanation of unfamiliar terms and note which costs are estimates. Check whether any charges will come from another business. A lower headline price does not tell you enough on its own. The useful question is what the full arrangement would include under the assumptions you have discussed."],
      ["h2", "Know where to find consumer information"],
      ["paragraph", "The FTC explains that the Funeral Rule gives consumers rights when dealing with covered funeral providers in the United States. These include getting price information by telephone and receiving an itemized statement after selecting arrangements. Read the FTC guidance for the details and exceptions that may apply. Keep that guidance beside your notes when preparing questions."],
      ["h2", "Review the information at your own pace"],
      ["paragraph", "Put the estimates next to each other and mark any missing answers. Ask for clarification before treating two totals as comparable. If someone is helping you with the decision give them the same written information so you are working from the same facts. Record the date of each estimate because prices and availability may change. The aim is a decision that fits your wishes and circumstances with fewer surprises about what was included."],
      ["link", "Read the FTC Funeral Rule guidance", "https://consumer.ftc.gov/articles/ftc-funeral-rule"],
    ],
  },
  {
    title: "Make beneficiary reviews part of your yearly routine",
    slug: "make-beneficiary-reviews-part-of-your-routine",
    excerpt: "A brief review can help you spot outdated information and prepare useful questions for your insurance provider.",
    category: "Policy care", image: "path", alt: "A quiet woodland path through a Scottish forest", photographer: "Alex Holyoake", file: "Forest_path_in_Scotland_(Unsplash).jpg",
    sections: [
      ["paragraph", "Life keeps moving after an insurance policy is issued. Relationships change and contact details become outdated. A regular beneficiary review is a practical way to check whether the information held by your insurer still reflects your intentions. Treat it as a review first rather than assuming a change is always needed."],
      ["h2", "Begin with the current record"],
      ["paragraph", "Ask your insurer how to view the beneficiary information it has on file. Work from that record instead of relying on an old note. Check that the names and other identifying details are accurate. If the policy allows both primary and contingent beneficiaries ask the insurer to explain how those designations work for your policy."],
      ["h2", "Think about what has changed"],
      ["paragraph", "Consider whether a significant life event has changed your intentions or created a question you need to resolve. Do not assume a personal conversation updates a policy record. Keep a separate list of questions for situations involving a minor or a trust. Those choices can have legal consequences and deserve advice suited to your circumstances."],
      ["h2", "Follow the insurer's process"],
      ["paragraph", "If you decide to request a change use the process your insurer provides. Ask how you will know it has been accepted and keep the confirmation with your policy records. A submitted form and a completed update are not necessarily the same thing. Follow up if the record does not show what you expected."],
      ["h2", "Help the right person find the policy"],
      ["paragraph", "The NAIC recommends that beneficiaries know about the policy and where relevant information can be found. You can discuss an appropriate way to share the insurer's name and the location of the records. Avoid sending sensitive details to people who do not need them. A short yearly reminder can keep this task manageable. The purpose is to reduce uncertainty for the people you intend to support while keeping the policy record aligned with your decisions."],
      ["link", "Read the NAIC guide for life insurance beneficiaries", "https://content.naic.org/article/consumer_insight_how_be_life_insurance_beneficiary_what_you_need_know_prepare.htm"],
    ],
  },
];

async function main() {
  const database = new URL(process.env.DATABASE_URL || "");
  if (!["127.0.0.1", "localhost"].includes(database.hostname) || database.pathname !== "/fa_local") throw new Error("This seed is restricted to the local fa_local database.");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    for (const story of stories) {
      const text = [story.title, story.excerpt, ...story.sections.map(section => section[1])].join(" ");
      if (/[,\u2013\u2014]/.test(text)) throw new Error(`Disallowed punctuation in ${story.slug}`);
      const document = blogSchema.parse({ title:story.title, slug:story.slug, excerpt:story.excerpt, category:story.category, author:"The Safe Quote Editorial Team", cover:`/images/blog/${story.image}.webp`, coverAlt:story.alt, credit:`Photo by ${story.photographer} · CC0 1.0`, creditUrl:`https://commons.wikimedia.org/wiki/File:${story.file}`, titleSize:52, titleColor:"#214f5a", blocks:story.sections.map(([type,text,url])=>({...newBlock(type as "paragraph"|"h2"|"link"),text,url:url||""})) });
      const result = await pool.query("INSERT INTO fa_blog_posts (id,slug,document,status,published_at) VALUES ($1,$2,$3,'published',now()) ON CONFLICT (slug) DO NOTHING", [randomUUID(),document.slug,JSON.stringify(document)]);
      console.log(`${result.rowCount ? "Added" : "Already exists"}: ${story.title}`);
    }
  } finally { await pool.end(); }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
