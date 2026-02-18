"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordian";
import { Card } from "@/components/ui/card";

export default function FAQSection() {
  const faqs = [
    {
      question: "How do I earn referral rewards?",
      answer:
        "Share your unique referral link with traders. When they trade on HELLO DEX, you earn 20% of the trading fees (0.06% per trade) automatically.",
    },
    {
      question: "When can I claim my rewards?",
      answer:
        "You can claim your rewards at any time. There's no minimum threshold or waiting period.",
    },
    {
      question: "What tokens can I earn?",
      answer:
        "You earn rewards in the same tokens that your referrals trade. For example, if they trade ETH/USDC, you'll earn both ETH and USDC.",
    },
    {
      question: "Are there any fees to claim?",
      answer:
        "Only standard blockchain network fees apply (~$2.50 on average). There are no additional platform fees.",
    },
    {
      question: "How long do referral earnings last?",
      answer:
        "Forever! Once someone uses your referral link, you earn from all their future trades with no expiration.",
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-formula font-normal uppercase text-primary">
        FAQ
      </h2>

      <Card className="dark:bg-[#121212] bg-slate-100 border-black/10 dark:border-[rgba(255,255,255,0.03)] rounded-xl overflow-hidden border">
        <Accordion type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-white/10 last:border-0"
            >
              <AccordionTrigger className="font-sans text-xs font-light hover:no-underline hover:text-primary py-4 ml-4 mr-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="font-sans text-xs font-light dark:text-[#a3a3a3] text-gray-500 pb-4 ml-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}
