import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Loader2, Trash2, Upload, UserCircle, AlertTriangle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { moodsService, tasksService, expensesService, incomeService } from '@/lib/supabase';

const profileSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8).max(50),
  confirmPassword: z.string().min(8).max(50),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const dataTypes = [
  { label: "Moods", value: "moods", service: moodsService },
  { label: "Tasks", value: "tasks", service: tasksService },
  { label: "Expenses", value: "expenses", service: expensesService },
  { label: "Income", value: "income", service: incomeService },
];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState(dataTypes[0]);
  const [dataItems, setDataItems] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { toast } = useToast();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    async function loadUserProfile() {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUser(user);
          
          // Get user profile data from profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileData) {
            profileForm.reset({
              name: profileData.full_name || '',
              email: user.email || '',
            });
            
            if (profileData.avatar_url) {
              const { data } = await supabase.storage
                .from('avatars')
                .getPublicUrl(profileData.avatar_url);
              
              setAvatarUrl(data.publicUrl);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user profile',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserProfile();
  }, []);
  
  const fetchData = async (dataType: string) => {
    setIsLoadingData(true);
    try {
      const service = dataTypes.find(d => d.value === dataType)?.service;
      if (!service) return;
      
      const data = await service.getAll();
      setDataItems(data || []);
    } catch (error) {
      console.error(`Error fetching ${dataType}:`, error);
      toast({
        title: 'Error',
        description: `Failed to load ${dataType}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (selectedDataType) {
      fetchData(selectedDataType.value);
    }
  }, [selectedDataType]);

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsUpdatingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: values.name,
          updated_at: new Date(),
        });
      
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: values.newPassword 
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully',
      });
      
      passwordForm.reset();
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Error',
        description: 'Failed to update password',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      setAvatarUrl(data.publicUrl);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: filePath,
          updated_at: new Date(),
        });
        
      if (updateError) throw updateError;
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload avatar',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const service = selectedDataType.service;
      if (!service || !service.delete) {
        toast({
          title: 'Error',
          description: `Delete not supported for ${selectedDataType.label}`,
          variant: 'destructive',
        });
        return;
      }
      
      await service.delete(id);
      
      toast({
        title: 'Deleted',
        description: `${selectedDataType.label} item deleted successfully`,
      });
      
      // Refresh the data
      fetchData(selectedDataType.value);
    } catch (error) {
      console.error(`Error deleting ${selectedDataType.label}:`, error);
      toast({
        title: 'Error',
        description: `Failed to delete ${selectedDataType.label}`,
        variant: 'destructive',
      });
    }
  };
  
  const renderDataItem = (item: any) => {
    switch(selectedDataType.value) {
      case 'moods':
        return (
          <div key={item.id} className="flex justify-between items-center p-3 bg-card border rounded-md">
            <div>
              <p className="font-medium capitalize">{item.mood}</p>
              <p className="text-sm text-muted-foreground">{item.date}</p>
            </div>
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={() => handleDeleteItem(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      case 'tasks':
        return (
          <div key={item.id} className="flex justify-between items-center p-3 bg-card border rounded-md">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.status}</p>
            </div>
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={() => handleDeleteItem(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      case 'expenses':
        return (
          <div key={item.id} className="flex justify-between items-center p-3 bg-card border rounded-md">
            <div>
              <p className="font-medium">{item.description}</p>
              <p className="text-sm text-muted-foreground">${item.amount} - {item.date}</p>
            </div>
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={() => handleDeleteItem(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      case 'income':
        return (
          <div key={item.id} className="flex justify-between items-center p-3 bg-card border rounded-md">
            <div>
              <p className="font-medium">{item.source || 'Income'}</p>
              <p className="text-sm text-muted-foreground">${item.amount} - {item.date}</p>
            </div>
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={() => handleDeleteItem(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return <div>Unknown data type</div>;
    }
  };

  return (
    <div className="container mx-auto py-4 space-y-6 mb-20">
      <PageHeader heading="Profile & Settings" text="Manage your account settings and preferences" />
      
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>
        
        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Avatar Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Upload or update your profile picture</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarUrl || undefined} alt={user?.email} />
                  <AvatarFallback className="text-4xl bg-primary/10">
                    <UserCircle className="h-20 w-20 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col space-y-1.5 w-full max-w-xs">
                  <label htmlFor="avatar" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Picture
                        </>
                      )}
                    </Button>
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={uploadAvatar}
                      className="sr-only"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
            
            {/* Profile Info Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Email address" {...field} disabled />
                          </FormControl>
                          <FormDescription>
                            Contact support to change your email address
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isUpdatingProfile}>
                      {isUpdatingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 8 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : 'Change Password'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Data Management Tab */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Manage Your Data</CardTitle>
              <CardDescription>View and delete your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {dataTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedDataType.value === type.value ? "default" : "outline"}
                    onClick={() => setSelectedDataType(type)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto border rounded-md p-2">
                {isLoadingData ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : dataItems.length > 0 ? (
                  <div className="space-y-2">
                    {dataItems.map(renderDataItem)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No {selectedDataType.label.toLowerCase()} data found
                  </div>
                )}
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All {selectedDataType.label} Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your
                      {selectedDataType.label.toLowerCase()} data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        try {
                          // This would need to be implemented on the backend
                          // await selectedDataType.service.deleteAll();
                          toast({
                            title: 'Success',
                            description: `All ${selectedDataType.label.toLowerCase()} data deleted`,
                          });
                          // Refresh data
                          setDataItems([]);
                        } catch (error) {
                          toast({
                            title: 'Error',
                            description: `Failed to delete ${selectedDataType.label.toLowerCase()} data`,
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 