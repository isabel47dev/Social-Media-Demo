// this is used to make refering to the containers more optimised as you only call from the html once for each
const postsContainer = document.querySelector("#posts");
const linksContainer = document.querySelector("#links");

// this is here for the demo as you need example image
// all rights and ownship of these images belong to the photographer and i take no ownership over this work
// (reference found in report but link here https://www.instagram.com/armand_vf/)
const exampleImages = [
  "images/photo1.jpg",
  "images/photo2.jpg",
  "images/photo3.jpg",
  "images/photo4.jpg",
  "images/photo5.jpg"
];

// this grabs a random image from the list
const getRandomImage = () =>
  exampleImages[
    Math.floor(Math.random() * exampleImages.length)
  ];

// this will grab posts from the local storage. the local storage stores data as strings which is done by using the JSON.parse, which converts it back into usable objects
const getPosts = () =>
  JSON.parse(localStorage.profilePosts || "[]");

// This will be used to save posts to the local storage. Then, JSON.stringify is used to convert the post objects into strings for storage
const setPosts = posts =>
  localStorage.setItem("profilePosts", JSON.stringify(posts));

// this is also done for the links
const getLinks = () =>
  JSON.parse(localStorage.profileLinks || "[]");

const setLinks = links =>
  localStorage.setItem("profileLinks", JSON.stringify(links));


// if theres no posts, it will create some example ones
if (!localStorage.profilePosts) {
  setPosts(
    Array.from({ length: 5 }, () => ({
      id: crypto.randomUUID(),
      text: "Example post content",
      image: getRandomImage(),
      likes: 0,
      comments: []
    }))
  );
}

// example link
if (!localStorage.profileLinks) {
  setLinks([{
      id: crypto.randomUUID(),
      url: "https://youtube.com",
      icon:"https://www.google.com/s2/favicons?domain=youtube.com&sz=64"
    }]);
}

// this is used to update the posts when needed
const updatePost = (id, callback) => {
  const posts = getPosts();
  const post = posts.find(p => p.id === id);
  if (!post) return;
  callback(post);
  setPosts(posts);
};

// this code is used to add new post
const addPost = () => {
  const posts = getPosts();
  posts.unshift({
    id: crypto.randomUUID(),
    text: "New post",
    image: getRandomImage(),
    likes: 0,
    comments: []
  });
  setPosts(posts);
  render();
};

// this is used to open and expand a post
const openModal = postId => {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  const box = document.createElement("div");
  box.classList.add("modal-box");
  const img = document.createElement("img");
  const side = document.createElement("div");
  side.classList.add("modal-side");
  const likeBtn = document.createElement("button");
  likeBtn.textContent = "Like";
  const likes = document.createElement("div");
  const comments = document.createElement("div");
  comments.classList.add("comments");
  const input = document.createElement("input");
  input.placeholder = "Comment...";
  // this is used to grab the informaiton from that specific post
  const getPost = () =>
    getPosts().find(p => p.id === postId);
  // refresh modal content
  const refresh = () => {
    const post = getPost();
    if (!post) return;
    img.src = post.image;
    likes.textContent = `${post.likes} likes`;
    comments.replaceChildren();
    const caption = document.createElement("div");
    caption.textContent = `user ${post.text}`;
    comments.append(caption);
    post.comments.forEach(c => {
      const div = document.createElement("div");
      div.textContent = c.text;
      comments.append(div);
    });
  };

  likeBtn.addEventListener("click", () => {
    updatePost(postId, p => p.likes++);
    refresh();
    render();
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && input.value.trim()) {
      updatePost(postId, p => {
        p.comments.push({text: input.value.trim()});
      });
      input.value = "";
      refresh();
      render();
    }
  });
  // close modal if clicking outside
  modal.addEventListener("click", e => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  refresh();
  side.append(
    likeBtn,
    likes,
    comments,
    input
  );
  box.append(img, side);
  modal.append(box);
  document.body.append(modal);
};

// this creates the posts UI
const render = () => {
  // if posts container doesnt exist stop
  if (!postsContainer) return;
  postsContainer.replaceChildren();
  getPosts().forEach(post => {
    const card = document.createElement("div");
    card.classList.add("post");
    const text = document.createElement("p");
    text.textContent = post.text;
    const img = document.createElement("img");
    img.src = post.image;
    img.classList.add("post-image");
    const actions = document.createElement("div");
    actions.classList.add("post-actions");
    const likeBtn = document.createElement("button");
    likeBtn.textContent = `❤️ ${post.likes}`;
    const commentsCount = document.createElement("span");
    commentsCount.textContent =
    `💬 ${post.comments.length} Comments`;
    const input = document.createElement("input");
    input.classList.add("comment-input");
    input.placeholder = "Comment...";
    // open modal
    img.addEventListener("click", () => {
      openModal(post.id);
    });

    // likes
    likeBtn.addEventListener("click", () => {
      updatePost(post.id, p => p.likes++);
      render();
    });

    // comments
    input.addEventListener("keydown", e => {
      if (e.key === "Enter" && input.value.trim()) {
        updatePost(post.id, p => {
          p.comments.push({
            text: input.value.trim()
          });
        });
        input.value = "";
        render();
      }
    });

    // builds the post
    actions.append(
      likeBtn,
      commentsCount
    );

    card.append(
      text,
      img,
      actions,
      input
    );
    postsContainer.append(card);
  });
};

// This creates the user-added links
const renderLinks = () => {
  // if the links container doesnt exist stop
  if (!linksContainer) return;
  linksContainer.replaceChildren();
  getLinks().forEach(link => {
    const card = document.createElement("div");
    card.classList.add("link-card");
    const icon = document.createElement("img");
    icon.classList.add("link-icon");
    icon.src = link.icon;
    // this is for opening the url
    icon.addEventListener("click", () => {
      window.open(link.url, "_blank");
    });
    const title = document.createElement("span");
    title.classList.add("link-title");
    // this gets the hostname
    title.textContent = (() => {
      try {
        return new URL(link.url).hostname;
      }
      catch {
        return link.url;
      }
    })();
    // this is for editing the link
    title.addEventListener("click", () => {
      const newUrl = prompt(
        "Enter URL:",
        link.url
      );
      if (!newUrl) return;
      try {
        const parsed = new URL(newUrl);
        const links = getLinks();
        const target = links.find(
          l => l.id === link.id
        );
        target.url = parsed.href;
        target.icon =`https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
        setLinks(links);
        renderLinks();
      } 
      catch {
        alert("Invalid URL");
      }
    });
    // delete link
    const del = document.createElement("button");
    del.classList.add("link-delete");
    del.textContent = "×";
    del.addEventListener("click", () => {
      setLinks(getLinks().filter(l => l.id !== link.id));
      renderLinks();
    });

    card.append(
      icon,
      title,
      del
    );
    linksContainer.append(card);
  });
};

// this adds the link
const addLink = () => {
  const url = prompt("Enter URL");
  if (!url) return;
  try {
    const parsed = new URL(url);
    const links = getLinks();
    links.push({
      id: crypto.randomUUID(),
      url: parsed.href,
      icon:
        `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`
    });
    setLinks(links);
    renderLinks();
  } 
  catch {
    alert("Invalid URL");
  }
};
// this is used to hide or show the elements with this feature
document
.querySelectorAll("[data-toggle]")
.forEach(input => {
    input.addEventListener("change", () => {
      document.querySelector(`#${input.dataset.toggle}`)
      ?.classList.toggle("hidden");
    });
  });

// this adds a post button
document.querySelector("#add-post-btn")
?.addEventListener("click", addPost);

// this adds the link button
document
.querySelector("#add-link-btn")
?.addEventListener("click", addLink);

// this is used to create the reset button
document
.querySelector("#reset-btn")
?.addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});

// this is for the dark/light theme buttons
document
.querySelectorAll("[data-theme]")
.forEach(btn => {
  btn.addEventListener("click", () => {
    document.body.classList.toggle("dark",btn.dataset.theme === "dark");
  });
});

// this is for the posts per row feature
document
.querySelector("#posts-per-row")
?.addEventListener("change", e => {
  if (!postsContainer) return;
  postsContainer.style.gridTemplateColumns =`repeat(${e.target.value}, 1fr)`;
});

// this is used to only render if containers exist
if (postsContainer) {
  render();
}
if (linksContainer) {
  renderLinks();
}