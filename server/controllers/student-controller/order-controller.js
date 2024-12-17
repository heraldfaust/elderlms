const crypto = require('crypto');
const Order = require("../../models/Order");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      orderStatus,
      paymentMethod,
      paymentStatus,
      orderDate,
      transactionId,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing,
    } = req.body;

    // Manually verify the transaction with Flutterwave
    const verifyTransaction = async (transactionId) => {
      const url = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to verify transaction');
      }

      return await response.json();
    };

    // Verify the transaction
    const verificationResponse = await verifyTransaction(transactionId);

    // Check if the transaction was successful
    if (
      verificationResponse.status === 'success' && 
      verificationResponse.data.status === 'successful' &&
      parseFloat(verificationResponse.data.amount) === parseFloat(coursePricing) &&
      verificationResponse.data.currency === 'NGN'
    ) {
      // Create a new order
      const newlyCreatedCourseOrder = new Order({
        userId,
        userName,
        userEmail,
        orderStatus: 'confirmed',
        paymentMethod: 'flutterwave',
        paymentStatus: 'paid',
        orderDate,
        paymentId: transactionId,
        instructorId,
        instructorName,
        courseImage,
        courseTitle,
        courseId,
        coursePricing,
      });

      await newlyCreatedCourseOrder.save();

      // Update student courses
      const studentCourses = await StudentCourses.findOne({
        userId: newlyCreatedCourseOrder.userId,
      });

      if (studentCourses) {
        // Check if course already exists in student's courses
        const courseExists = studentCourses.courses.some(
          course => course.courseId.toString() === courseId
        );

        if (!courseExists) {
          studentCourses.courses.push({
            courseId: newlyCreatedCourseOrder.courseId,
            title: newlyCreatedCourseOrder.courseTitle,
            instructorId: newlyCreatedCourseOrder.instructorId,
            instructorName: newlyCreatedCourseOrder.instructorName,
            dateOfPurchase: newlyCreatedCourseOrder.orderDate,
            courseImage: newlyCreatedCourseOrder.courseImage,
          });

          await studentCourses.save();
        }
      } else {
        const newStudentCourses = new StudentCourses({
          userId: newlyCreatedCourseOrder.userId,
          courses: [
            {
              courseId: newlyCreatedCourseOrder.courseId,
              title: newlyCreatedCourseOrder.courseTitle,
              instructorId: newlyCreatedCourseOrder.instructorId,
              instructorName: newlyCreatedCourseOrder.instructorName,
              dateOfPurchase: newlyCreatedCourseOrder.orderDate,
              courseImage: newlyCreatedCourseOrder.courseImage,
            },
          ],
        });

        await newStudentCourses.save();
      }

      // Update the course schema students
      await Course.findByIdAndUpdate(newlyCreatedCourseOrder.courseId, {
        $addToSet: {
          students: {
            studentId: newlyCreatedCourseOrder.userId,
            studentName: newlyCreatedCourseOrder.userName,
            studentEmail: newlyCreatedCourseOrder.userEmail,
            paidAmount: newlyCreatedCourseOrder.coursePricing,
          },
        },
      });

      return res.status(200).json({
        success: true,
        message: "Order confirmed and course purchased successfully",
        data: newlyCreatedCourseOrder,
      });
    } else {
      // Payment verification failed
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (err) {
    console.error('Error in createOrder:', err);

    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the payment",
      error: err.message,
    });
  }
};

module.exports = { 
  createOrder
};