import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import { insertWaitlistSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// Extend the waitlist schema with more validation
const waitlistFormSchema = insertWaitlistSchema.extend({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  university: z.string().min(2, {
    message: "Please enter your institution name.",
  }),
  role: z.enum(["student", "faculty", "staff", "club-leader", "other"], {
    message: "Please select your role.",
  }),
  interests: z.array(z.string()).optional(),
  wantsUpdates: z.boolean().default(false),
});

type WaitlistFormValues = z.infer<typeof waitlistFormSchema>;

const WaitlistForm = () => {
  const { toast } = useToast();
  const [interestInput, setInterestInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Default form values
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      university: "",
      role: "student",
      interests: [],
      wantsUpdates: false,
    },
  });

  const waitlistMutation = useMutation({
    mutationFn: async (values: WaitlistFormValues) => {
      const response = await apiRequest("POST", "/api/waitlist", values);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "You've joined the waitlist!",
        description: "We'll notify you when CampusConnect launches at your institution.",
      });
      form.reset();
      setInterests([]);
      setFormSubmitted(true);
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error.message || "There was an error joining the waitlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: WaitlistFormValues) => {
    // Include the interests array in the submission
    values.interests = interests;
    waitlistMutation.mutate(values);
  };

  const addInterest = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && interestInput.trim()) {
      e.preventDefault();
      if (!interests.includes(interestInput.trim())) {
        const newInterests = [...interests, interestInput.trim()];
        setInterests(newInterests);
        form.setValue("interests", newInterests);
      }
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    const newInterests = interests.filter(i => i !== interest);
    setInterests(newInterests);
    form.setValue("interests", newInterests);
  };

  if (formSubmitted) {
    return (
      <Card className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">Thank You!</h3>
        <p className="text-gray-600 mb-6">
          You've been added to our waitlist. We'll contact you when CampusConnect launches at your institution.
        </p>
        <Button onClick={() => setFormSubmitted(false)}>Join Another Email</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
              <FormItem>
                <FormLabel>University/College</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your institution name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty Member</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="club-leader">Club Leader</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel htmlFor="interests">Interests (Optional)</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {interests.map((interest, index) => (
                <Badge key={index} className="bg-primary-100 text-primary-800 hover:bg-primary-200">
                  {interest}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => removeInterest(interest)}
                  />
                </Badge>
              ))}
            </div>
            <Input
              id="interests"
              placeholder="Type an interest and press Enter"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={addInterest}
            />
            <FormDescription>
              Add your interests to help us tailor your experience.
            </FormDescription>
          </div>
          
          <FormField
            control={form.control}
            name="wantsUpdates"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Email Updates</FormLabel>
                  <FormDescription>
                    I'd like to receive updates about CampusConnect's launch and features.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            className="w-full"
            disabled={waitlistMutation.isPending}
          >
            {waitlistMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Join the Waitlist
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Already on the waitlist? <a href="#" className="text-primary hover:underline">Check your status</a></p>
      </div>
    </Card>
  );
};

export default WaitlistForm;
