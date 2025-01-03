import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  getCurrentCourseProgressService,
  markLectureAsViewedService,
  resetCourseProgressService,
} from "@/services";
import { Check, ChevronLeft, ChevronRight, Play, Menu } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";

function StudentViewCourseProgressPage() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { studentCurrentCourseProgress, setStudentCurrentCourseProgress } =
    useContext(StudentContext);
  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { id } = useParams();

  async function fetchCurrentCourseProgress() {
    const response = await getCurrentCourseProgressService(auth?.user?._id, id);
    if (response?.success) {
      if (!response?.data?.isPurchased) {
        setLockCourse(true);
      } else {
        setStudentCurrentCourseProgress({
          courseDetails: response?.data?.courseDetails,
          progress: response?.data?.progress,
        });

        if (response?.data?.completed) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);

          return;
        }

        if (response?.data?.progress?.length === 0) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
        } else {
          console.log("logging here");
          const lastIndexOfViewedAsTrue = response?.data?.progress.reduceRight(
            (acc, obj, index) => {
              return acc === -1 && obj.viewed ? index : acc;
            },
            -1
          );

          setCurrentLecture(
            response?.data?.courseDetails?.curriculum[
              lastIndexOfViewedAsTrue + 1
            ]
          );
        }
      }
    }
  }

  async function updateCourseProgress() {
    if (currentLecture) {
      const response = await markLectureAsViewedService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id,
        currentLecture._id
      );

      if (response?.success) {
        fetchCurrentCourseProgress();
      }
    }
  }

  async function handleRewatchCourse() {
    const response = await resetCourseProgressService(
      auth?.user?._id,
      studentCurrentCourseProgress?.courseDetails?._id
    );

    if (response?.success) {
      setCurrentLecture(null);
      setShowConfetti(false);
      setShowCourseCompleteDialog(false);
      fetchCurrentCourseProgress();
    }
  }

  useEffect(() => {
    fetchCurrentCourseProgress();
  }, [id]);

  useEffect(() => {
    if (currentLecture?.progressValue === 1) updateCourseProgress();
  }, [currentLecture]);

  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);

  console.log(currentLecture, "currentLecture");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSideBarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ... (keep existing service functions)

  return (
    <div className="flex flex-col min-h-screen bg-[#1c1d1f] text-white">
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="flex items-center justify-between p-2 md:p-4 bg-[#1c1d1f] border-b border-gray-700">
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button
            onClick={() => navigate("/student-courses")}
            className="text-black bg-[#ffffc2] hover:bg-[#ffffc2] hover:text-black text-xs md:text-sm"
            size="sm"
          >
            <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Back to My Courses</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h1 className="text-sm md:text-lg font-bold truncate max-w-[150px] md:max-w-full">
            {studentCurrentCourseProgress?.courseDetails?.title}
          </h1>
        </div>
        <Button
          onClick={() => setIsSideBarOpen(!isSideBarOpen)}
          size="sm"
          className="p-1 md:p-2"
        >
          {isMobile ? (
            <Menu className="h-5 w-5" />
          ) : isSideBarOpen ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 relative overflow-hidden">
        <div
          className={`flex-1 transition-all duration-300 ${
            isSideBarOpen && !isMobile ? "mr-[320px]" : ""
          }`}
        >
          <div className="w-full">
            <VideoPlayer
              width="100%"
              height={isMobile ? "240px" : "500px"}
              url={currentLecture?.videoUrl?.replace(/^http:\/\//, "https://")}
              onProgressUpdate={setCurrentLecture}
              progressData={currentLecture}
            />
          </div>
          <div className="p-3 md:p-6 bg-[#1c1d1f]">
            <h2 className="text-lg md:text-2xl font-bold mb-2 line-clamp-2">
              {currentLecture?.title}
            </h2>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`fixed top-[48px] md:top-[64px] right-0 bottom-0 w-full md:w-[320px] 
          bg-[#1c1d1f] border-l border-gray-700 transition-all duration-300 z-10
          ${isSideBarOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="grid bg-[#1c1d1f] w-full grid-cols-2 p-0 h-12 md:h-14">
              <TabsTrigger
                value="content"
                className="text-white rounded-none h-full text-sm md:text-base"
              >
                Course Content
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className="text-white rounded-none h-full text-sm md:text-base"
              >
                Overview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="flex-1">
              <ScrollArea className="h-[calc(100vh-160px)]">
                <div className="p-4 space-y-4">
                  {studentCurrentCourseProgress?.courseDetails?.curriculum.map(
                    (item) => (
                      <button
                        key={item._id}
                        onClick={() => {
                          setCurrentLecture(item);
                          if (isMobile) setIsSideBarOpen(false);
                        }}
                        className={`flex items-center space-x-2 text-sm text-white font-bold w-full text-left p-2 rounded hover:bg-gray-800 transition-colors
                        ${
                          currentLecture?._id === item._id ? "bg-gray-800" : ""
                        }`}
                      >
                        {studentCurrentCourseProgress?.progress?.find(
                          (progressItem) => progressItem.lectureId === item._id
                        )?.viewed ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Play className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="line-clamp-2">{item?.title}</span>
                      </button>
                    )
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="overview" className="flex-1">
              <ScrollArea className="h-[calc(100vh-160px)]">
                <div className="p-4">
                  <h2 className="text-lg md:text-xl font-bold mb-4">
                    About this course
                  </h2>
                  <p className="text-gray-200 text-sm md:text-base">
                    {studentCurrentCourseProgress?.courseDetails?.description}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={lockCourse}>
        <DialogContent className="sm:w-[425px] w-[90%] mx-auto">
          <DialogHeader>
            <DialogTitle>You can't view this page</DialogTitle>
            <DialogDescription>
              Please purchase this course to get access
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showCourseCompleteDialog}>
        <DialogContent
          showOverlay={false}
          className="sm:w-[425px] w-[90%] mx-auto"
        >
          <DialogHeader>
            <DialogTitle>Congratulations!</DialogTitle>
            <DialogDescription className="flex flex-col gap-3">
              <Label>You have completed the course</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate("/student-courses")}
                  className="w-full sm:w-auto"
                >
                  My Courses Page
                </Button>
                <Button
                  onClick={handleRewatchCourse}
                  className="w-full sm:w-auto"
                >
                  Rewatch Course
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseProgressPage;
