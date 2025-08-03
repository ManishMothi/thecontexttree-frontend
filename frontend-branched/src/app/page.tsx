import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="flex items-center mb-8">
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-800 border-gray-200"
            >
              <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
              Now Live for Early Access
            </Badge>
          </div>

          {/* Hero content */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
                The end of endless chat scrolls
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Branched is a branch-and-merge memory layer for LLM apps that
                keeps conversations organized, efficient, and under control. No
                more lost context or ballooning token costs.
              </p>

              {/* CTA buttons */}
              <div className="flex items-center space-x-4 mb-8">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-black text-white hover:bg-gray-800 px-8"
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-black border-gray-300 hover:bg-gray-50"
                >
                  View Demo →
                </Button>
              </div>

              {/* Trust indicators */}
              <div>
                <p className="text-gray-500 mb-4">
                  Trusted by developers and businesses worldwide
                </p>
                <div className="flex flex-wrap items-center gap-8 opacity-60">
                  <div className="text-gray-400 font-medium text-lg">
                    Startups
                  </div>
                  <div className="text-gray-400 font-medium text-sm">
                    ENTERPRISE
                    <br />
                    SOLUTIONS
                  </div>
                  <div className="text-gray-400 font-bold text-lg">
                    Developers
                  </div>
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="text-gray-400 font-medium text-lg">SMBs</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-center">
                <Image
                  src="/branched-logo.png"
                  alt="Branched AI Assistant"
                  width={400}
                  height={400}
                  className="w-full max-w-md"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Product screenshot */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg overflow-hidden">
                <Image
                  src="/branched-chat.png"
                  alt="Anara research interface showing document analysis and AI chat"
                  width={1200}
                  height={800}
                  className="w-full h-auto rounded-lg shadow-md"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The Problem with Today&apos;s Chatbots
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Modern AI conversations are broken. They cram everything into
                one endless scroll, making it impossible to maintain context,
                control costs, or explore different conversation paths.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="p-6 border border-gray-200 shadow-sm">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6 text-gray-600"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Branch Anywhere</h3>
                <p className="text-gray-600">
                  Fork conversations at any point to explore tangents without
                  cluttering the main thread.
                </p>
              </Card>

              {/* Feature 2 */}
              <Card className="p-6 border border-gray-200 shadow-sm">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6 text-gray-600"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Smarter Context</h3>
                <p className="text-gray-600">
                  Focuses only on the most relevant conversation path, reducing
                  token usage and improving response quality.
                </p>
              </Card>

              {/* Feature 3 */}
              <Card className="p-6 border border-gray-200 shadow-sm">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6 text-gray-600"
                    >
                      <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9 9 9 0 0 1 9 9z" />
                      <path d="M12 3v18" />
                      <path d="M3 12h18" />
                      <path d="M12 3a9 9 0 0 1 9 9" />
                      <path d="M12 3a9 9 0 0 0-9 9" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Modular Memory</h3>
                <p className="text-gray-600">
                  Auto-summarize and index older branches for efficient recall
                  when needed.
                </p>
              </Card>

              {/* Feature 4 */}
              <Card className="p-6 border border-gray-200 shadow-sm">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6 text-gray-600"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <path d="m3.3 7 8.7 5 8.7-5" />
                      <path d="M12 22V12" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Simple Integration
                </h3>
                <p className="text-gray-600">
                  Just two endpoints (POST /branch, GET /context) that work with
                  any LLM provider.
                </p>
              </Card>

              {/* Feature 5 */}
              <Card className="p-6 border border-gray-200 shadow-sm">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6 text-gray-600"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Cost Efficient</h3>
                <p className="text-gray-600">
                  Dramatically reduce token usage and API costs while improving
                  conversation quality.
                </p>
              </Card>

              {/* Feature 6 */}
              <Card className="p-6 border border-gray-200 shadow-sm">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6 text-gray-600"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="M12 18v-6" />
                      <path d="M9 15h6" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Developer Friendly
                </h3>
                <p className="text-gray-600">
                  Clean API, comprehensive documentation, and SDKs for all major
                  platforms.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="bg-black text-white py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to transform your chatbot experience?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join developers and companies who use Branched to deliver better
              chatbot experiences for their clients.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 px-8"
                >
                  Get started for free
                </Button>
              </Link>
              <Link href="mailto:mmanish0881@gmail.com?subject=Demo%20Request%20-%20Branched&body=Hi%2C%0A%0AI%27m%20interested%20in%20scheduling%20a%20demo%20of%20Branched.%20Please%20let%20me%20know%20when%20you%27re%20available.%0A%0ABest%20regards">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white border-black text-black hover:bg-gray-100 px-8 opacity-100"
                >
                  Schedule a demo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
