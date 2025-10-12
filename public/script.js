new Vue({
  el: "#app",

  data: {
    currentPage: 1,
    lightMode: true,
    cartOpen: false,
    cart: [],
    total: 0,
    homeOpen: true,
    lessonOpen: false,
    searchOpen: false,
    currentCategory: "All",
    currentOrder: "Asc",

    searchQuery: "",
    previousPage: "",
    searchDebounce: null,
    name: null,
    phoneNo: null,

    systemMessage: null,
    displayedLesson: null,
    messageTimeout: null,

    searchResult: [],
    lessons: [],
    fullLessons: null,
  },

  computed: {
    //Applying pagination when needed as we only display a maximum of 9 items at a time
    paginatedSearchResults() {
      const start = (this.currentPage - 1) * 9;
      return this.searchResult.slice(start, start + 9).filter(Boolean);
    },
    paginatedlessons() {
      const start = (this.currentPage - 1) * 9;
      return this.lessons.slice(start, start + 9).filter(Boolean);
    },
    totalSearchPages() {
      return Math.ceil(this.searchResult.length / 9);
    },
  },

  methods: {
    goToNextPage() {
      this.currentPage++;
    },
    goToPreviousPage() {
      this.currentPage--;
    },
    toggleMode() {
      document.body.classList.toggle("dark-mode");
      this.lightMode = !this.lightMode;
      //Changing the icon depending on the mode
      document.getElementById("toggle-mode").src = this.lightMode
        ? "./images/moon.svg"
        : "./images/light.svg";
    },
    viewlesson(lesson, pageName) {
      this.displayedLesson = lesson;
      this.homeOpen = false;
      this.lessonOpen = true;
      this.searchOpen = false;
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

    viewCart() {
      this.searchOpen = false;
      this.homeOpen = false;
      this.lessonOpen = false;
      this.cartOpen = true;
    },
    removeItem(lesson) {
      this.cart = this.cart.filter((item) => item.tutor !== lesson.tutor);
      this.total -= lesson.price;
      lesson.spaces++;
      this.showSystemMessage(`Lesson removed from cart`, 2000);
    },

    checkout() {
      //checking for valid name and phone number using regex
      const nameRegex = /^[A-Za-z\s]+$/;
      const phoneRegex = /^[0-9]+$/;

      if (!nameRegex.test(this.name)) {
        this.showSystemMessage("❌ Name must contain letters only.", 2000);
        return;
      }

      if (!phoneRegex.test(this.phoneNo)) {
        this.showSystemMessage("❌ Phone must contain numbers only.", 2000);
        return;
      }

      //Getting current date and time in dd/mm/yyyy and hh:mm formats
      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(
        today.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${today.getFullYear()}`;
      const currentTime = `${today.getHours()}:${today
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      const order = {
        name: this.name,
        phoneNo: this.phoneNo,
        date: formattedDate,
        time: currentTime,
        lessons: this.cart.map((item) => ({
          lessonID: item.lessonID,
          tutor: item.tutor,
          price: item.price,
          spaces: item.spaces,
        })),
        total: this.total,
      };

      fetch("http://localhost:8000/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      })
        .then((res) => res.json())
        .then((data) => {
          // Update lesson spaces after order is created
          return fetch(`http://localhost:8000/order/${data.orderId}/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          });
        })
        .then((res) => res.json())
        .then((message) => {
          this.total = 0;
          this.cart = [];
          this.cartOpen = false;
          this.homeOpen = true;
          this.name = null;
          this.phoneNo = null;
          this.showSystemMessage(message.message, 2000);
        })
        .catch((err) => this.showSystemMessage("❌ Error: " + err, 2000));
    },
    exitlessonPage() {
      this.lessonOpen = false;
      if (this.previousPage === "search") this.searchOpen = true;
      else if (this.previousPage === "home") this.homeOpen = true;
    },

    searchlessons() {
      //If the search query string is cleared, close the search page
      if (this.searchQuery.trim() === "") {
        this.searchResult = [];
        this.goHome();
        return;
      }

      //Clearing the previous timeout
      clearTimeout(this.searchDebounce);

      //Adding a debounce to the query to avoid bombarding the server with requests
      //The debounce will ensure that requests are sent with a delay of 300ms to avoid overloading the server
      //It also gives the user a bit of time to correct spelling mistakes
      this.searchDebounce = setTimeout(() => {
        fetch(`http://localhost:8000/search/${this.searchQuery}`)
          .then((res) => res.json())
          .then((data) => {
            this.searchResult = data;
            for (const lesson of this.searchResult) {
              const existingItem = this.cart.find(
                (item) => item.lessonID === lesson.lessonID
              );

              //To display the updated spaces while the item is in the cart, but checkout is not done yet
              if (existingItem) {
                lesson.spaces--;
              }
            }
            this.homeOpen = false;
            this.cartOpen = false;
            this.lessonOpen = false;
            this.searchOpen = true;
          })
          .catch((err) => this.showSystemMessage("❌ Error: " + err, 2000));
      }, 300);
    },

    clearSearch() {
      this.searchQuery = "";
      this.lessonOpen = false;
      this.searchResult = [];
      this.homeOpen = true;
      this.searchOpen = false;
      this.cartOpen = false;
      this.currentPage = 1;
    },
    goHome() {
      this.homeOpen = true;
      this.lessonOpen = false;
      this.searchOpen = false;
      this.cartOpen = false;
      this.currentPage = 1;
    },

    filterLessons(category) {
      //If "All" is selected, remove all filters and display the lists of lessons like in the beginning
      if (category === "All") {
        this.lessons = [...this.fullLessons];
        this.currentCategory = "All";
      } else {
        this.currentCategory = category;
        this.sortlessons(this.currentOrder);
      }
      this.currentPage = 1;
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

  //Function that will be called upon mounting of the app to fetch the list of lessons
  mounted() {
    fetch("http://localhost:8000/lessons")
      .then((res) => res.json())
      .then((data) => {
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
