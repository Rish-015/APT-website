import { Star } from "lucide-react"

const testimonials = [
    {
        name: "Ramesh Kumar",
        role: "Wheat Farmer, Punjab",
        content: "The AI crop recommendations completely changed how I plan my season. My yield increased by 20% compared to last year.",
        rating: 5,
    },
    {
        name: "Lakshmi Narayanan",
        role: "Vegetable Grower, Tamil Nadu",
        content: "I used the disease detection feature when my tomato plants started yellowing. It accurately identified the blight and saved my crop.",
        rating: 5,
    },
    {
        name: "Amit Patel",
        role: "Cotton Farmer, Gujarat",
        content: "The market price tracker is invaluable. I knew exactly when to sell my cotton this year for the best profit margin.",
        rating: 4,
    },
    {
        name: "Suresh Reddy",
        role: "Paddy Farmer, Andhra Pradesh",
        content: "The weather alerts are much more accurate than the local news. The interface is clean and easy to use even on my farm.",
        rating: 5,
    }
]

export function TestimonialsCarousel() {
    return (
        <section className="py-20 bg-background overflow-hidden relative">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        Trusted by Modern Farmers
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        See how our platform is making a real difference in yields and profitability.
                    </p>
                </div>

                {/* CSS Scroll Snap Carousel */}
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar pt-4">
                    {testimonials.map((testimonial, idx) => (
                        <div
                            key={idx}
                            className="snap-center shrink-0 w-[85vw] md:w-[400px] bento-card p-8 bg-card"
                        >
                            <div className="flex gap-1 mb-6 text-primary">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'fill-current' : 'text-muted stroke-current'}`} />
                                ))}
                            </div>
                            <p className="text-lg text-foreground mb-8 text-pretty leading-relaxed">
                                "{testimonial.content}"
                            </p>
                            <div className="mt-auto">
                                <p className="font-bold text-foreground">{testimonial.name}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
