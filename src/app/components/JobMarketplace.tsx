import { useState } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Clock, Building, ChevronRight, Filter } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAppNavigate } from '../hooks/useAppNavigate';

export function JobMarketplace() {
  const { navigate } = useAppNavigate();
  const [activeTab, setActiveTab] = useState('browse');

  return (
    <div className="h-screen pt-[24px] pb-[64px] bg-background overflow-y-auto pr-[0px] pl-[0px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl tracking-tight mb-1">Job Marketplace</h1>
          <p className="text-sm text-muted-foreground">Find your next career opportunity</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="browse" className="text-sm">Browse Jobs</TabsTrigger>
            <TabsTrigger value="applications" className="text-sm">My Applications</TabsTrigger>
            <TabsTrigger value="saved" className="text-sm">Saved Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {/* Search and Filters */}
            <Card className="p-4">
              <div className="grid md:grid-cols-12 gap-3">
                <div className="md:col-span-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Job title, specialty, keyword..."
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <Select defaultValue="all-locations">
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-locations">All Locations</SelectItem>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="bangalore">Bangalore</SelectItem>
                      <SelectItem value="pune">Pune</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3">
                  <Select defaultValue="all-types">
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-types">All Types</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="visiting">Visiting Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Button className="w-full h-9 text-sm">
                    <Filter className="w-3 h-3 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                <Badge variant="secondary" className="cursor-pointer hover:bg-accent text-xs">
                  Immediate Joining
                </Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-accent text-xs">
                  Verified Hospitals
                </Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-accent text-xs">
                  High Salary
                </Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-accent text-xs">
                  Remote Options
                </Badge>
              </div>
            </Card>

            {/* Results */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {jobListings.length} opportunities
              </div>
              <Select defaultValue="recent">
                <SelectTrigger className="w-[180px] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="salary-high">Highest Salary</SelectItem>
                  <SelectItem value="salary-low">Lowest Salary</SelectItem>
                  <SelectItem value="relevant">Most Relevant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Job Listings */}
            <div className="space-y-3">
              {jobListings.map((job) => (
                <Card key={job.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <h3 className="flex-1 text-base">{job.title}</h3>
                            <Badge variant="secondary" className="text-xs">{job.type}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">{job.hospital}</div>
                          
                          <div className="flex flex-wrap gap-3 text-xs mb-3">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="w-3 h-3" />
                              <span>{job.salary}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Briefcase className="w-3 h-3" />
                              <span>{job.experience}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{job.postedDate}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {job.benefits.map((benefit, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Button size="sm" className="text-xs">
                          Apply Now
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Save
                        </Button>
                        <div className="text-xs text-muted-foreground mt-1">
                          {job.applicants} applicants
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-6">
              <Button variant="outline" size="lg" className="text-sm">
                Load More Jobs
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card className="p-4">
              <h3 className="mb-4 text-base">My Applications</h3>
              <div className="space-y-3">
                {myApplications.map((application) => (
                  <div key={application.id} className="p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 flex-1">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="mb-0.5 text-sm">{application.position}</h4>
                          <div className="text-xs text-muted-foreground mb-1">
                            {application.hospital} • {application.location}
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-muted-foreground">Applied on {application.appliedDate}</span>
                            <Badge 
                              className={
                                application.status === 'Interview Scheduled' 
                                  ? 'bg-green-100 text-green-800 border-0 text-xs' 
                                  : 'text-xs'
                              }
                            >
                              {application.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card className="p-6">
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="mb-2 text-base">No saved jobs yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start saving job postings you're interested in
                </p>
                <Button onClick={() => setActiveTab("browse")} className="text-sm">
                  Browse Jobs
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}