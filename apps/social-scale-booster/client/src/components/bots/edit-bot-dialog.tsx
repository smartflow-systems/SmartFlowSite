import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bot } from "@shared/schema";
import { insertBotSchema } from "@shared/schema";
import { z } from "zod";

const editBotSchema = insertBotSchema.omit({ userId: true }).extend({
  name: z.string().min(1, "Bot name is required"),
  platform: z.enum(["tiktok", "instagram", "facebook", "twitter", "youtube"]),
});

type EditBotForm = z.infer<typeof editBotSchema>;

interface EditBotDialogProps {
  bot: Bot;
  children: React.ReactNode;
}

export default function EditBotDialog({ bot, children }: EditBotDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditBotForm>({
    resolver: zodResolver(editBotSchema),
    defaultValues: {
      name: bot.name,
      description: bot.description || "",
      platform: bot.platform as any,
    },
  });

  const editBotMutation = useMutation({
    mutationFn: async (data: EditBotForm) => {
      return apiRequest("PUT", `/api/bots/${bot.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({
        title: "Bot Updated",
        description: "Your bot has been successfully updated.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditBotForm) => {
    editBotMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card-bg border-secondary-brown">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent-gold">
            Edit Bot
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Bot Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter bot name"
                      className="bg-darkBrown border-secondaryBrown text-white placeholder:text-neutralGray focus:border-accentGold"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe what your bot does..."
                      className="bg-darkBrown border-secondaryBrown text-white placeholder:text-neutralGray focus:border-accentGold min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Platform</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-darkBrown border-secondaryBrown text-white focus:border-accentGold">
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-darkBrown border-secondaryBrown">
                      <SelectItem value="tiktok" className="text-white hover:bg-secondaryBrown">
                        TikTok
                      </SelectItem>
                      <SelectItem value="instagram" className="text-white hover:bg-secondaryBrown">
                        Instagram
                      </SelectItem>
                      <SelectItem value="facebook" className="text-white hover:bg-secondaryBrown">
                        Facebook
                      </SelectItem>
                      <SelectItem value="twitter" className="text-white hover:bg-secondaryBrown">
                        Twitter
                      </SelectItem>
                      <SelectItem value="youtube" className="text-white hover:bg-secondaryBrown">
                        YouTube
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 border-secondaryBrown text-neutralGray hover:bg-secondaryBrown hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editBotMutation.isPending}
                className="flex-1 bg-accentGold text-primaryBlack hover:opacity-90 font-semibold"
              >
                {editBotMutation.isPending ? "Updating..." : "Update Bot"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}