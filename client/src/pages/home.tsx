import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import FeaturedEvents from "@/components/featured-events";
import WaitlistForm from "@/components/waitlist-form";
import ChatAssistant from "@/components/chat-assistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  CalendarIcon, 
  FilterIcon, 
  MessageSquare, 
  Search, 
  Smartphone, 
  Users 
} from "lucide-react";

const features = [
  {
    icon: <CalendarIcon className="h-8 w-8 text-primary" />,
    title: "Events & Clubs Listing",
    description: "Browse and discover campus events and clubs with detailed information on time, location, and descriptions."
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: "AI Campus Assistant",
    description: "Get instant answers about clubs, events, and campus life from our intelligent AI chatbot."
  },
  {
    icon: <FilterIcon className="h-8 w-8 text-primary" />,
    title: "Smart Filtering",
    description: "Easily filter events by categories like Sports, Academic, Arts, and create your own custom categories."
  },
  {
    icon: <Search className="h-8 w-8 text-primary" />,
    title: "Advanced Search",
    description: "Find exactly what you're looking for with our powerful search functionality across all campus activities."
  },
  {
    icon: <CalendarIcon className="h-8 w-8 text-primary" />,
    title: "Calendar View",
    description: "View events in a calendar format to better plan your schedule and never miss important activities."
  },
  {
    icon: <Smartphone className="h-8 w-8 text-primary" />,
    title: "Mobile Responsive",
    description: "Access CampusConnect from any device with our fully responsive design optimized for mobile usage."
  }
];

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Computer Science, Junior",
    text: "CampusConnect has completely changed how I engage with campus activities. I used to miss out on so many events, but now I'm always in the loop!"
  },
  {
    name: "Maya Patel",
    role: "Business, Sophomore",
    text: "The AI chat feature is amazing! I can quickly find information about clubs without having to search through emails or social media. Such a time-saver!"
  },
  {
    name: "David Wang",
    role: "Political Science, Senior",
    text: "As a club president, CampusConnect has made it so much easier to promote our events and connect with interested students. Our membership has grown significantly!"
  }
];

const faqs = [
  {
    question: "When will CampusConnect launch?",
    answer: "We're planning to launch CampusConnect at the beginning of the next semester. Everyone on the waitlist will get early access two weeks before the official launch."
  },
  {
    question: "Is CampusConnect free to use?",
    answer: "Yes, CampusConnect is completely free for students. We work directly with universities to provide this service as part of your campus resources."
  },
  {
    question: "Can I create my own club or event on the platform?",
    answer: "Absolutely! CampusConnect allows students to create and manage their own clubs and events with approval from university administrators to ensure quality."
  },
  {
    question: "How does the AI chat assistant work?",
    answer: "Our AI assistant is trained on campus-specific information and can answer questions about events, clubs, locations, and more. It learns from interactions to provide increasingly accurate and helpful responses."
  },
  {
    question: "Which universities currently support CampusConnect?",
    answer: "We're launching with several partner universities in the upcoming semester. Join the waitlist to be notified when your institution is added or to help us bring CampusConnect to your campus."
  }
];

const Home = () => {
  const { data: featuredEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/events/featured'],
  });

  const [isShowingChat, setIsShowingChat] = useState(false);

  // Intersection observer to track sections for highlighting active nav items
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            // Could use this to highlight the nav item
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Your Campus Life, Organized</h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover events, join clubs, and connect with your campus community - all in one place.
                </p>
              </div>
              
              {/* AI Chat Assistant - Search Bar Style */}
              <div className="mt-4">
                <div className="max-w-2xl mx-auto">
                  <ChatAssistant showByDefault={false} />
                </div>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="#waitlist">
                  <Button size="lg">Join the Waitlist</Button>
                </Link>
                <Link href="#demo">
                  <Button variant="outline" size="lg">See Demo</Button>
                </Link>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <span className="text-xs">AJ</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-secondary-500 text-white flex items-center justify-center">
                    <span className="text-xs">MP</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <span className="text-xs">DW</span>
                  </div>
                </div>
                <div className="text-gray-500">Join <span className="font-bold text-primary">120+</span> students already on the waitlist</div>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
              <div className="rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                <div className="aspect-video w-full rounded-md bg-gray-100 overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                    <div className="text-center">
                      <Users className="h-16 w-16 mx-auto text-primary mb-2" />
                      <p className="text-gray-600 text-xl">Campus community visual</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-8 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-gray-500 text-sm font-medium">TRUSTED BY LEADING INSTITUTIONS</h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            <div className="w-24 h-12 flex items-center justify-center">
              <span className="text-gray-400 font-bold text-xl">HARVARD</span>
            </div>
            <div className="w-24 h-12 flex items-center justify-center">
              <span className="text-gray-400 font-bold text-xl">STANFORD</span>
            </div>
            <div className="w-24 h-12 flex items-center justify-center">
              <span className="text-gray-400 font-bold text-xl">MIT</span>
            </div>
            <div className="w-24 h-12 flex items-center justify-center">
              <span className="text-gray-400 font-bold text-xl">BERKELEY</span>
            </div>
            <div className="w-24 h-12 flex items-center justify-center">
              <span className="text-gray-400 font-bold text-xl">UCLA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything you need for campus life</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              CampusConnect brings together all your campus activities in one place, helping you discover events, join clubs, and connect with your community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FeaturedEvents Section */}
      <FeaturedEvents 
        events={Array.isArray(featuredEvents) ? featuredEvents : []} 
        isLoading={isLoadingEvents} 
      />

      {/* Demo Section */}
      <section id="demo" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">See CampusConnect in action</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Take a look at how CampusConnect makes discovering campus events and clubs easier than ever.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-5 gap-8 items-stretch">
            <div className="lg:col-span-3 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-gray-800 p-3 flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-gray-400 text-sm mx-auto">CampusConnect - Dashboard</div>
              </div>
              <div className="p-6 bg-white">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-primary text-white p-4 flex justify-between items-center">
                    <h3 className="font-medium">Upcoming Events</h3>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" className="text-white h-8 w-8">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-white h-8 w-8">
                        <FilterIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="divide-y">
                    {[
                      {
                        date: { month: "SEP", day: "15" },
                        title: "Campus Career Fair",
                        location: "Main Hall",
                        time: "10:00 AM - 4:00 PM",
                        tags: ["Career", "Networking"]
                      },
                      {
                        date: { month: "SEP", day: "18" },
                        title: "Chess Club Tournament",
                        location: "Student Center, Room 101",
                        time: "5:30 PM",
                        tags: ["Club", "Games"]
                      },
                      {
                        date: { month: "SEP", day: "22" },
                        title: "International Food Festival",
                        location: "Campus Quad",
                        time: "12:00 PM - 3:00 PM",
                        tags: ["Food", "Cultural"]
                      }
                    ].map((event, i) => (
                      <div key={i} className="p-4">
                        <div className="flex gap-4 items-start">
                          <div className="bg-primary-100 text-primary-800 rounded p-2 text-center min-w-[60px]">
                            <div className="text-xs font-bold">{event.date.month}</div>
                            <div className="text-xl font-bold">{event.date.day}</div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-500">{event.location} • {event.time}</p>
                            <div className="mt-2 flex items-center gap-2">
                              {event.tags.map((tag, j) => (
                                <span 
                                  key={j} 
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    j % 2 === 0 ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs h-8">
                            <CalendarIcon className="h-3 w-3 mr-1" /> RSVP
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <ChatAssistant showByDefault={false} />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Students Say</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Students across campus are excited about how CampusConnect is transforming their university experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 flex">
                    {[...Array(5)].map((_, j) => (
                      <svg 
                        key={j} 
                        className="w-4 h-4 fill-current" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center mr-3">
                    <span className="font-medium text-sm">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-16 md:py-24 bg-primary-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Join the Waitlist</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Be among the first to experience CampusConnect when we launch. Fill out the form below to secure your spot on our waitlist.
              </p>
            </div>
            
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Got questions about CampusConnect? Find answers to the most common questions below.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Chat Assistant Float Button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full shadow-lg"
        size="icon"
        onClick={() => setIsShowingChat(!isShowingChat)}
      >
        <MessageSquare className="h-5 w-5" />
      </Button>

      {isShowingChat && (
        <div className="fixed bottom-16 right-4 w-80 md:w-96 z-50">
          <ChatAssistant showByDefault={true} onClose={() => setIsShowingChat(false)} />
        </div>
      )}
    </div>
  );
};

export default Home;
