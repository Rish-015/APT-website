"use client"

import { useState } from "react"
import { LandingNavbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        toast.success("Thank you! Your message has been sent successfully.")
        setIsSubmitting(false)
            ; (e.target as HTMLFormElement).reset()
    }

    const contactInfo = [
        {
            icon: Phone,
            title: "Call Us",
            detail: "+91 90031 81180",
            description: "Monday - Friday, 9am - 6pm",
            color: "text-blue-500",
            bgColor: "bg-blue-50"
        },
        {
            icon: Mail,
            title: "Email Us",
            detail: "ceo.agroputhalvantechnologies@gmail.com",
            description: "We'll respond within 24 hours",
            color: "text-emerald-500",
            bgColor: "bg-emerald-50"
        },
        {
            icon: MapPin,
            title: "Visit Us",
            detail: "Agro Puthalvan Tech Park",
            description: "Chennai, Tamil Nadu, India",
            color: "text-orange-500",
            bgColor: "bg-orange-50"
        }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <LandingNavbar />

            <main className="flex-1">
                {/* Hero Summary Section */}
                <section className="relative py-20 bg-white border-b overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-50/50 to-transparent pointer-events-none" />
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <div className="max-w-3xl mx-auto">
                            <h4 className="text-[#00c563] font-bold uppercase tracking-widest text-sm mb-3">Contact Support</h4>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
                                We're Here to <span className="text-[#1390d4]">Help</span> You Grow.
                            </h1>
                            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                                Have questions about our AI farming solutions or need technical support?
                                Reach out to our team of agricultural technology experts.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="py-16 lg:py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-12 gap-12">

                            {/* Contact Details Column */}
                            <div className="lg:col-span-5 space-y-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Get in Touch</h2>
                                    <p className="text-slate-600 mb-8">
                                        Feel free to reach out through any of these channels. Our team is dedicated to providing you with the best experience and support.
                                    </p>
                                </div>

                                <div className="grid gap-4">
                                    {contactInfo.map((info, idx) => (
                                        <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-6 flex items-start gap-4">
                                                <div className={`p-3 rounded-xl ${info.bgColor}`}>
                                                    <info.icon className={`h-6 w-6 ${info.color}`} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{info.title}</h4>
                                                    <p className="text-lg font-medium text-slate-700 mt-1">{info.detail}</p>
                                                    <p className="text-sm text-slate-500 mt-1">{info.description}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Working Hours & Global Presence */}
                                <div className="p-8 rounded-3xl bg-[#1390d4] text-white overflow-hidden relative">
                                    <div className="absolute -right-8 -bottom-8 opacity-10">
                                        <Globe className="h-48 w-48" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Support Hours
                                    </h3>
                                    <ul className="space-y-3 font-medium">
                                        <li className="flex justify-between border-b border-white/20 pb-2">
                                            <span>Monday - Friday</span>
                                            <span>09:00 AM - 06:00 PM</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/20 pb-2">
                                            <span>Saturday</span>
                                            <span>10:00 AM - 02:00 PM</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Sunday</span>
                                            <span>Closed</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Contact Form Column */}
                            <div className="lg:col-span-7">
                                <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                                    <CardContent className="p-8 md:p-12">
                                        <div className="mb-10 text-center">
                                            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
                                                <MessageSquare className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900">Send us a Message</h3>
                                            <p className="text-slate-500 mt-2">Fill out the form below and we'll get back to you shortly.</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                                    <Input
                                                        required
                                                        placeholder="John Doe"
                                                        className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-emerald-500 rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                                    <Input
                                                        type="email"
                                                        required
                                                        placeholder="john@example.com"
                                                        className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-emerald-500 rounded-xl"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 ml-1">Subject</label>
                                                <Input
                                                    required
                                                    placeholder="How can we help you?"
                                                    className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-emerald-500 rounded-xl"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 ml-1">Your Message</label>
                                                <Textarea
                                                    required
                                                    placeholder="Tell us more about your inquiry..."
                                                    rows={6}
                                                    className="border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-emerald-500 rounded-xl resize-none p-4"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full h-14 text-lg font-bold bg-[#00c563] hover:bg-[#00a352] text-white shadow-lg shadow-emerald-200/50 rounded-xl transition-all hover:-translate-y-0.5"
                                            >
                                                {isSubmitting ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Sending Message...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Send className="h-5 w-5" />
                                                        Send Message
                                                    </div>
                                                )}
                                            </Button>

                                            <p className="text-center text-xs text-slate-400 mt-6">
                                                By submitting this form, you agree to our <span className="underline cursor-pointer">Privacy Policy</span> and <span className="underline cursor-pointer">Terms of Service</span>.
                                            </p>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Map Section Placeholder */}
                <section className="container mx-auto px-4 pb-20">
                    <div className="rounded-3xl overflow-hidden border-8 border-white shadow-2xl h-96 relative bg-slate-200">
                        {/* Placeholder for Map - In a real app we'd use Google Maps Iframe */}
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 flex-col text-slate-400">
                            <MapPin className="h-12 w-12 mb-4 animate-bounce" />
                            <p className="font-bold text-lg">Indented Map Location Placeholder</p>
                            <p className="text-sm">Agro Puthalvan Technologies HQ, Chennai</p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
