import { courseCategories } from "@/config";
import banner from "../../../../public/banner.jpg";
import { Button } from "@/components/ui/button";
import { useContext, useEffect } from "react";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import { AuthContext } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";

function StudentHomePage() {
  const { studentViewCoursesList, setStudentViewCoursesList } =
    useContext(StudentContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Unified Text-to-Speech Function
  const speakText = (text) => {
    if (window.FlutterTTS) {
      // Use Flutter's TTS
      window.FlutterTTS.postMessage(text);
    } else if (window.speechSynthesis) {
      // Fallback to browser's SpeechSynthesis API
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      speechSynthesis.speak(utterance);
    } else {
      console.warn("Text-to-Speech is not supported in this environment.");
    }
  };

  function handleNavigateToCoursesPage(getCurrentId, categoryLabel) {
    speakText(`You clicked on ${categoryLabel} category.`);

    sessionStorage.removeItem("filters");
    const currentFilter = {
      category: [getCurrentId],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    navigate("/courses");
  }

  async function fetchAllStudentViewCourses() {
    const response = await fetchStudentViewCourseListService();
    if (response?.success) setStudentViewCoursesList(response?.data);
  }

  async function handleCourseNavigate(getCurrentCourseId, courseTitle) {
    // Announce the course title when clicked
    speakText(`You clicked on the course titled ${courseTitle}.`);

    const response = await checkCoursePurchaseInfoService(
      getCurrentCourseId,
      auth?.user?._id
    );

    if (response?.success) {
      if (response?.data) {
        navigate(`/course-progress/${getCurrentCourseId}`);
      } else {
        navigate(`/course/details/${getCurrentCourseId}`);
      }
    }
  }

  useEffect(() => {
    fetchAllStudentViewCourses();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      <section className="flex flex-col lg:flex-row items-center justify-between py-8 px-4 lg:px-8">
        <div className="lg:w-2/2 lg:pr-12">
          <h1 className="text-4xl font-bold mb-4">
            Empowering Seniors with Digital Confidence
          </h1>
          <p className="text-xl mb-4">
            Discover a simple, intuitive app designed to help older adults master essential digital skills. From online safety to social media and video calls, our app makes learning easy, accessible, and rewarding.
          </p>
        </div>
        <div className="lg:w-full mb-8 lg:mb-0">
          <img
            src={banner}
            className="w-[600px] h-auto rounded-lg shadow-lg"
            alt="Banner"
          />
        </div>
      </section>
      <section className="py-8 px-4 lg:px-8 bg-[#F5F5DC]">
        <h2 className="text-2xl font-bold mb-6">Course Categories</h2>
        <div className="flex flex-wrap gap-2">
          {courseCategories.map((categoryItem) => (
            <Button
              className="justify-start hover:bg-black hover:text-[#F5F5DC] flex-[1_0_45%] sm:flex-[1_0_30%] md:flex-[1_0_22%]"
              variant="outline"
              key={categoryItem.id}
              onClick={() =>
                handleNavigateToCoursesPage(categoryItem.id, categoryItem.label)
              }
            >
              {categoryItem.label}
            </Button>
          ))}
        </div>
      </section>
      <section className="py-12 px-4 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">Featured Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 dark">
          {studentViewCoursesList && studentViewCoursesList.length > 0 ? (
            studentViewCoursesList.map((courseItem) => (
              <div
                onClick={() =>
                  handleCourseNavigate(courseItem?._id, courseItem?.title)
                }
                className="shadow rounded-lg overflow-hidden bg-[#ffffc2] text-black cursor-pointer"
                key={courseItem?._id}
              >
                <img
                  src={courseItem?.image}
                  width={300}
                  height={150}
                  className="w-full h-40 object-cover"
                  alt={courseItem?.title}
                />
                <div className="p-4">
                  <h3 className="font-bold mb-2">{courseItem?.title}</h3>
                  <p className="text-sm text-black mb-2">
                    {courseItem?.instructorName}
                  </p>
                  <p className="font-bold text-[16px]">
                    NGN {courseItem?.pricing}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <h1>No Courses Found</h1>
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentHomePage;
