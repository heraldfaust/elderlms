import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  createPaymentService,
  fetchStudentViewCourseDetailsService,
} from "@/services";

import { CheckCircle, Globe, Lock, PlayCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FlutterWaveButton, closePaymentModal } from 'flutterwave-react-v3';

function StudentViewCourseDetailsPage() {
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    currentCourseDetailsId,
    setCurrentCourseDetailsId,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const { auth } = useContext(AuthContext);

  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] =
    useState(null);
  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  async function fetchStudentViewCourseDetails() {
    const response = await fetchStudentViewCourseDetailsService(
      currentCourseDetailsId
    );

    if (response?.success) {
      setStudentViewCourseDetails(response?.data);
      setLoadingState(false);
    } else {
      setStudentViewCourseDetails(null);
      setLoadingState(false);
    }
  }

  function handleSetFreePreview(getCurrentVideoInfo) {
    console.log(getCurrentVideoInfo);
    setDisplayCurrentVideoFreePreview(getCurrentVideoInfo?.videoUrl);
  }

  const config = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY, 
    tx_ref: `course-purchase-${Date.now()}`,
    amount: studentViewCourseDetails?.pricing || 0,
    currency: 'NGN',
    customer: {
      email: auth?.user?.userEmail || '',
      name: `${auth?.user?.userName || ''}`,
    },
    customizations: {
      title: 'Course Purchase',
      description: studentViewCourseDetails?.title || 'Course Purchase',
      logo: studentViewCourseDetails?.image || 'https://your-logo-url.com',
    },
  };

  const handleFlutterPayment = async (response) => {
    console.log(response);
    if (response.status === 'completed') {

      const paymentPayload = {
        userId: auth?.user?._id,
        userName: auth?.user?.userName,
        userEmail: auth?.user?.userEmail,
        orderStatus: "confirmed",
        paymentMethod: "flutterwave",
        paymentStatus: "paid",
        orderDate: new Date(),
        transactionId: response.transaction_id,
        instructorId: studentViewCourseDetails?.instructorId,
        instructorName: studentViewCourseDetails?.instructorName,
        courseImage: studentViewCourseDetails?.image,
        courseTitle: studentViewCourseDetails?.title,
        courseId: studentViewCourseDetails?._id,
        coursePricing: studentViewCourseDetails?.pricing,
      };

      const verifyResponse = await createPaymentService(paymentPayload);

      if (verifyResponse.success) {

        navigate(`/course-progress/${currentCourseDetailsId}`);
      }
    }

    closePaymentModal();
  };

  useEffect(() => {
    if (displayCurrentVideoFreePreview !== null) setShowFreePreviewDialog(true);
  }, [displayCurrentVideoFreePreview]);

  useEffect(() => {
    if (currentCourseDetailsId !== null) fetchStudentViewCourseDetails();
  }, [currentCourseDetailsId]);

  useEffect(() => {
    if (id) setCurrentCourseDetailsId(id);
  }, [id]);

  useEffect(() => {
    if (!location.pathname.includes("course/details"))
      setStudentViewCourseDetails(null),
        setCurrentCourseDetailsId(null);
  }, [location.pathname]);

  if (loadingState) return <Skeleton />;

  const getIndexOfFreePreviewUrl =
    studentViewCourseDetails !== null
      ? studentViewCourseDetails?.curriculum?.findIndex(
          (item) => item.freePreview
        )
      : -1;

  return (
    <div className="mx-auto p-4 bg-[#F5F5DC]">
      <div className="bg-black text-white p-8 rounded-t-lg">
        <h1 className="text-3xl font-bold mb-4">
          {studentViewCourseDetails?.title}
        </h1>
        <p className="text-xl mb-4">{studentViewCourseDetails?.subtitle}</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 mt-2 text-sm">
  <span>Created By {studentViewCourseDetails?.instructorName}</span>
  <span>Created On {studentViewCourseDetails?.date.split("T")[0]}</span>
  <span className="flex items-center">
    <Globe className="mr-1 h-4 w-4" />
    {studentViewCourseDetails?.primaryLanguage}
  </span>
  <span>
    {studentViewCourseDetails?.students.length}{" "}
    {studentViewCourseDetails?.students.length <= 1
      ? "Student"
      : "Students"}
  </span>
</div>

      </div>
      <div className="flex flex-col md:flex-row gap-2 mt-8 ">
        <main className="flex-grow">
          <Card className="mb-8 bg-[#ffffc2]">
            <CardHeader>
              <CardTitle>What you'll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {studentViewCourseDetails?.objectives
                  .split(",")
                  .map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="mb-8 bg-[#ffffc2]">
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>{studentViewCourseDetails?.description}</CardContent>
          </Card>
          <Card className="mb-8 bg-[#ffffc2]">
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              {studentViewCourseDetails?.curriculum?.map(
                (curriculumItem, index) => (
                  <li
                    key={index}
                    className={`${
                      curriculumItem?.freePreview
                        ? "cursor-pointer"
                        : "cursor-not-allowed"
                    } flex items-center mb-4`}
                    onClick={
                      curriculumItem?.freePreview
                        ? () => handleSetFreePreview(curriculumItem)
                        : null
                    }
                  >
                    {curriculumItem?.freePreview ? (
                      <PlayCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <Lock className="mr-2 h-4 w-4" />
                    )}
                    <span>{curriculumItem?.title}</span>
                  </li>
                )
                
              )}
            </CardContent>
          </Card>
        </main>
        <aside className="w-full md:w-[500px]  md:p-0">
  <div className="md:card md:bg-[#ffffc2] md:rounded-lg md:shadow sticky top-4">
    <div className=" md:p-6">
      <div className="aspect-video mb-4 rounded-lg flex items-center justify-center">
      <VideoPlayer
  url={
    getIndexOfFreePreviewUrl !== -1
      ? studentViewCourseDetails?.curriculum[
          getIndexOfFreePreviewUrl
        ].videoUrl.replace("http://", "https://")
      : ""
  }
  width="450px"
  height="200px"
/>
      </div>
      <div className="mb-4">
        <span className="text-3xl font-bold">
          NGN {studentViewCourseDetails?.pricing}
        </span>
      </div>
      <FlutterWaveButton
        className="w-full bg-black py-5 text-white"
        {...config}
        text="Buy Now"
        callback={handleFlutterPayment}
        onClose={() => {
          // Optional: Handle modal close
        }}
      />
    </div>
  </div>
</aside>

      </div>
      <Dialog
        open={showFreePreviewDialog}
        onOpenChange={() => {
          setShowFreePreviewDialog(false);
          setDisplayCurrentVideoFreePreview(null);
        }}
      >
        <DialogContent className="w-[800px]">
          <DialogHeader>
            <DialogTitle>Course Preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-video rounded-lg flex items-center justify-center">
          <VideoPlayer
  url={displayCurrentVideoFreePreview.replace("http://", "https://")}
  width="450px"
  height="200px"
/>

          </div>
          <div className="flex flex-col gap-2">
            {studentViewCourseDetails?.curriculum
              ?.filter((item) => item.freePreview)
              .map((filteredItem, index) => (
                <p
                  key={index}
                  onClick={() => handleSetFreePreview(filteredItem)}
                  className="cursor-pointer text-[16px] font-medium"
                >
                  {filteredItem?.title}
                </p>
              ))}
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseDetailsPage;