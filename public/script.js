new Vue({
  el: "#app",
  data: {
    currentPage: 1,
    systemMessage: null,
    currentPage: 1,
    homeOpen: true,
    lessons: [],
    fullLessons: null,
    cart: [],
    total: 0,
  },

  methods: {
    goToNextPage() {
      this.currentPage++;
    },
    goToPreviousPage() {
      this.currentPage--;
    },
    viewlesson(lesson, pageName) {
      this.displayedLesson = lesson;
      this.homeOpen = false;
      this.lessonOpen = true;
      this.previousPage = pageName; //This allows us to know where we should go after pressing the back page, since the lesson page can be accessed from home and from search
    },
    //Function to display system messages for a certain amount of time
    showSystemMessage(msg, duration) {
      this.systemMessage = msg;
      if (this.messageTimeout) clearTimeout(this.messageTimeout);
      this.messageTimeout = setTimeout(() => {
        this.systemMessage = null;
        this.messageTimeout = null;
      }, duration);
    },
    addToCart(lesson) {
      //Checking if the lesson is already present in the cart
      const existingItem = this.cart.find(
        (item) => item.tutor === lesson.tutor
      );
      if (existingItem) {
        this.showSystemMessage(`Lesson already present in cart`, 2000);
      } else {
        this.cart.push(lesson);
        lesson.spaces--;
        this.showSystemMessage(`Lesson added to cart`, 2000);
      }
      this.total += lesson.price;
    },
    sortlessons(order) {
      this.currentOrder = order;
      if (this.currentCategory !== "All") {
        const key = this.currentCategory;
        this.lessons.sort((a, b) => {
          if (this.currentOrder === "Asc") {
            // sorting based on whether the field contains letters or numbers
            return typeof a[key] === "string" //Checking the data type of the filter applied
              ? a[key].localeCompare(b[key])
              : a[key] - b[key];
          } else {
            return typeof a[key] === "string"
              ? b[key].localeCompare(a[key])
              : b[key] - a[key];
          }
        });
      }
    },
  },
  computed: {
    //Applying pagination when needed as we only display a maximum of 9 items at a time
    paginatedlessons() {
      const start = (this.currentPage - 1) * 9;
      return this.lessons.slice(start, start + 9).filter(Boolean);
    },
  },

  //Function that will be called upon mounting of the app to fetch the list of lessons
  mounted() {
    fetch("http://localhost:8000/lessons")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.lessons = [...data];
        //Saving a copy of the full list of lessons as a reference to be used when needed
        this.fullLessons = [...data];
      })
      .catch((err) => {
        this.showSystemMessage("Error: " + err, 2000);
        console.error("Error:", err);
      });
  },
});
