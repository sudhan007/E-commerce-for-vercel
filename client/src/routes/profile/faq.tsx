import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export const Route = createFileRoute('/profile/faq')({
  component: FAQPage,
})

function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'How do I update my profile information?',
      answer:
        'Go to your profile settings by clicking on your avatar in the top right corner. From there, you can edit your name, bio, profile picture, and other personal information.',
    },
    {
      question: 'Can I change my username?',
      answer:
        "Yes! In the profile settings, you'll find an option to change your username. Note that you can only change it once every 30 days, and it must be unique across the platform.",
    },
    {
      question: 'How do I delete my account?',
      answer:
        "We're sad to see you go! You can delete your account from the Privacy & Safety section in settings. This action is permanent and cannot be undone. All your data will be removed within 30 days.",
    },
    {
      question: 'Is my data private and secure?',
      answer:
        'Absolutely. We use industry-standard encryption and security practices. Your personal information is never shared with third parties without your explicit consent.',
    },
    {
      question: 'How do I report a bug or suggest a feature?',
      answer:
        'You can reach us at support@example.com or use the feedback form in the Help section. We review all submissions and truly appreciate your input!',
    },
    {
      question: 'Can I use this platform on mobile?',
      answer:
        'Yes! Our site is fully responsive and works great on phones and tablets. We also have native apps available on iOS and Android app stores.',
    },
  ]

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="fonnt-jost">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          {/* <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about your profile and account
          </p> */}
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-gray-200 last:border-b-0"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-6 py-5 sm:px-8 sm:py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="text-lg sm:text-xl font-medium text-gray-900 pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-gray-500 shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              <div
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-2">
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-lg">
            Still have questions?{' '}
            <a
              href="mailto:support@example.com"
              className="text-blue-600 font-semibold hover:text-blue-700 underline transition-colors"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
