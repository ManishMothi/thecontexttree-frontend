import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          {/* Y Combinator badge */}
          <div className="flex items-center mb-8">
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-800 border-gray-200"
            >
              <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
              Backed by Y Combinator
            </Badge>
          </div>

          {/* Hero content */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
                The end of endless chat scrolls
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                ContextTree is a branch-and-merge memory layer for LLM apps that
                keeps conversations organized, efficient, and under control. No
                more lost context or ballooning costs.
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
                  alt="ContextTree AI Assistant"
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

        {/* Use cases section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Transform Your Conversations with AI
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover how ContextTree is revolutionizing AI conversations
                across different industries and use cases.
              </p>
            </div>

            <Tabs defaultValue="developers" className="w-full">
              <TabsList className="grid grid-cols-3 max-w-2xl mx-auto mb-8">
                <TabsTrigger value="developers">Developers</TabsTrigger>
                <TabsTrigger value="businesses">Businesses</TabsTrigger>
                <TabsTrigger value="support">Support Teams</TabsTrigger>
              </TabsList>

              <TabsContent value="developers" className="mt-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">
                      Build Smarter Chatbots
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Developers use ContextTree to create AI assistants that
                      remember conversations, understand context, and deliver
                      more natural interactions.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>
                          Easy integration with our developer-friendly API
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Persistent conversation memory</span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Customizable AI personalities</span>
                      </li>
                    </ul>
                    <Button className="mt-8 bg-black text-white hover:bg-gray-800">
                      View Documentation
                    </Button>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="font-semibold text-gray-600">J</span>
                        </div>
                        <div>
                          <p className="font-medium">Jamal Williams</p>
                          <p className="text-sm text-gray-500">
                            Senior Developer, Tech Startup
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600">
                        &ldquo;ContextTree has completely transformed how we
                        build conversational AI. The persistent memory feature
                        alone has made our chatbot interactions feel so much
                        more natural and human-like.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="businesses" className="mt-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">
                      Enhance Customer Engagement
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Businesses use ContextTree to create AI assistants that
                      provide personalized, context-aware support to their
                      customers 24/7.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Reduce support costs by up to 40%</span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Improve customer satisfaction scores</span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Seamless handoff to human agents</span>
                      </li>
                    </ul>
                    <Button className="mt-8 bg-black text-white hover:bg-gray-800">
                      Schedule Demo
                    </Button>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="font-semibold text-gray-600">S</span>
                        </div>
                        <div>
                          <p className="font-medium">Sarah Johnson</p>
                          <p className="text-sm text-gray-500">
                            COO, E-commerce Platform
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600">
                        &ldquo;Since implementing ContextTree, our customer
                        satisfaction has increased by 35%. The ability to
                        maintain context across conversations has been a
                        game-changer for our support team.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="support" className="mt-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">
                      Empower Your Support Team
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Support teams use ContextTree to provide faster, more
                      accurate responses while reducing ticket volume and
                      resolution times.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Reduce response times by up to 70%</span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>
                          Handle multiple conversations simultaneously
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Access to conversation history and context</span>
                      </li>
                    </ul>
                    <Button className="mt-8 bg-black text-white hover:bg-gray-800">
                      Learn More
                    </Button>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="font-semibold text-gray-600">M</span>
                        </div>
                        <div>
                          <p className="font-medium">Miguel Rodriguez</p>
                          <p className="text-sm text-gray-500">
                            Support Team Lead, SaaS Company
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600">
                        &ldquo;ContextTree has transformed our support
                        operations. Our team can now handle 3x more
                        conversations with higher satisfaction ratings. The AI
                        remembers previous interactions, so customers don&apos;t
                        have to repeat themselves.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* FAQ section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to know about ContextTree. Can&apos;t find
                the answer you&apos;re looking for? Our team is here to help.
              </p>
            </div>

            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold mb-3">
                  How does ContextTree maintain conversation context?
                </h3>
                <p className="text-gray-600">
                  ContextTree uses advanced AI to remember previous interactions
                  and maintain context throughout conversations. Our system
                  tracks conversation history, user preferences, and contextual
                  cues to deliver more natural and coherent responses, even in
                  long-running conversations.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold mb-3">
                  What platforms can I deploy ContextTree on?
                </h3>
                <p className="text-gray-600">
                  ContextTree can be deployed on websites, mobile apps, and
                  popular messaging platforms. Our flexible API and SDKs make
                  integration seamless across multiple channels, allowing you to
                  maintain consistent conversations with your users wherever
                  they are.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold mb-3">
                  How secure is my conversation data?
                </h3>
                <p className="text-gray-600">
                  We prioritize your data security and privacy. All
                  conversations are encrypted both in transit and at rest. You
                  maintain full ownership of your data, and we never use it to
                  train our models without explicit permission. For detailed
                  information, please review our Privacy Policy and Terms of
                  Service.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold mb-3">
                  Can I customize the AI&apos;s personality and responses?
                </h3>
                <p className="text-gray-600">
                  Absolutely! ContextTree offers extensive customization
                  options. You can tailor the AI&apos;s tone, style, and
                  knowledge base to match your brand voice and specific use
                  case. Our intuitive dashboard makes it easy to train the AI on
                  your specific domain knowledge and preferred responses.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  How does ContextTree handle multiple languages?
                </h3>
                <p className="text-gray-600">
                  ContextTree supports multiple languages and can maintain
                  context across language switches within the same conversation.
                  Our AI understands and responds naturally in various
                  languages, making it ideal for global businesses and
                  multilingual support teams.
                </p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <h3 className="text-2xl font-semibold mb-4">
                Need more information?
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Our team of AI experts is ready to help you implement the
                perfect conversational solution for your needs.
              </p>
              <Button variant="outline" className="border-gray-300">
                Contact Our Team
              </Button>
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
              Join hundreds of developers and companies who use Branched to
              deliver better chatbot experiences for their clients.
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
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-white/10"
              >
                Schedule a demo
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Updates
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Resources
              </h4>
              <ul className="space-y-2">
                n{" "}
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    API Status
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Press
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Licenses
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-black rounded-md mr-2"></div>
              <span className="font-semibold">Branched</span>
            </div>
            <p className="mt-4 md:mt-0 text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Branched, Inc. All rights
              reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
