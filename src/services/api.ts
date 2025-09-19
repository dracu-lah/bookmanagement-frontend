/* eslint-disable no-useless-catch */
import api from "@/configs/axios";
import endPoint from "./endPoint";

/************************************************************************************************************************************************************************************************************************************************************************************************************************/
/* AUTH START */
export const LoginAPI = async (params: any) => {
  try {
    const { data } = await api.post(`${endPoint.login}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdatePermissionsAPI = async (params: any) => {
  try {
    const { data } = await api.post(`${endPoint.updateMenus}`, params, {
      params: { RoleName: params.RoleName },
    });
    return data;
  } catch (error) {
    throw error;
  }
};
// export const GetPermissionsAPI = async (params) => {
//   try {
//     const { data } = await api.get(`${endPoint.getMenus}`, {
//       params: params,
//     });
//     return data;
//   } catch (error) {
//     throw error;
//   }
// };
//
export const GetPermissionsAPI = async ({ roles }: { roles: any }) => {
  const menuApiResponse = {
    status: "Success",
    data: [
      {
        id: 1,
        key: "dashboard",
        routeName: "Dashboard",
        isEnabled: true,
        availablePermissions: [],
        permissions: [],
        parent: "dashboard",
        parentID: 0,
        submenus: [],
      },

      {
        id: 5,
        key: "users",
        routeName: "Users",
        isEnabled: false,
        availablePermissions: [],
        permissions: [],
        parent: "users",
        parentID: 0,
        submenus: [
          {
            id: 8,
            key: "roleManagement",
            routeName: "Manage Roles",
            isEnabled: true,
            availablePermissions: ["view", "create", "assign", "revoke"],
            permissions: ["view", "create", "assign", "revoke"],
            parent: "users",
            parentID: 5,
            submenus: [],
          },
          {
            id: 9,
            key: "userManagement",
            routeName: "Manage Users",
            isEnabled: true,
            availablePermissions: [
              "view",
              "add",
              "update",
              "deactivate",
              "view",
              "add",
              "update",
              "deactivate",
            ],
            permissions: [],
            parent: "users",
            parentID: 5,
            submenus: [],
          },
        ],
      },
    ],
  };
  return new Promise((resolve, reject) => {
    // Simulate an asynchronous API call delay
    setTimeout(() => {
      // Simulate a successful response
      resolve(menuApiResponse);

      // To simulate an error, you could use:
      // reject(new Error("Failed to fetch permissions"));
    }, 500); // Simulate a 500ms network delay
  });
};
export const ChangePasswordAPI = async (params: any) => {
  try {
    const { data } = await api.post(`${endPoint.changePassword}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};
/* AUTH END */
/************************************************************************************************************************************************************************************************************************************************************************************************************************/
/* DASHBOARD  START */
export const GetDashboardAPI = async (params: any) => {
  try {
    const { data } = await api.get(`${endPoint.getDashboardData}`, {
      params: params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/* DASHBOARD  END */
/************************************************************************************************************************************************************************************************************************************************************************************************************************/
/* USER MANAGEMENT START */
export const CreateUserAPI = async (params: any) => {
  try {
    const { data } = await api.post(`${endPoint.register}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const AssignUserAPI = async (params: any) => {
  try {
    const { data } = await api.post(`${endPoint.assignUser}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteUserAPI = async (params: any) => {
  try {
    const { data } = await api.post(`${endPoint.outets}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};
export const UpdateUserPasswordAPI = async (params: any) => {
  try {
    const { data } = await api.post(`${endPoint.updateUserPassword}`, null, {
      params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
export const GetUsersAPI = async (params: any) => {
  try {
    const { data } = await api.get(`${endPoint.getUsers}`, { params });
    return data;
  } catch (error) {
    throw error;
  }
};

/* ROLE START */

export const CreateRoleAPI = async (params: any) => {
  try {
    const { data } = await api.post(`${endPoint.registerRole}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetRolesAPI = async (params: any) => {
  try {
    const { data } = await api.get(`${endPoint.getRoles}`, {
      params: params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
/* ROLE END */

/* USER MANAGEMENT END */
/************************************************************************************************************************************************************************************************************************************************************************************************************************/
/* BOOK  MANAGEMENT START */

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  status: "Available" | "Issued";
}

let booksData: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction",
    publishedYear: 1925,
    status: "Available",
  },
  {
    id: "2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    publishedYear: 1960,
    status: "Issued",
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    publishedYear: 1949,
    status: "Available",
  },
];

export const bookApi = {
  getBooks: async (): Promise<Book[]> => {
    await new Promise((res) => setTimeout(res, 800));
    return [...booksData];
  },

  createBook: async (book: Omit<Book, "id">): Promise<Book> => {
    await new Promise((res) => setTimeout(res, 500));
    const newBook = { ...book, id: Date.now().toString() };
    booksData.push(newBook);
    return newBook;
  },

  updateBook: async (id: string, book: Omit<Book, "id">): Promise<Book> => {
    await new Promise((res) => setTimeout(res, 500));
    const index = booksData.findIndex((b) => b.id === id);
    if (index === -1) throw new Error("Book not found");
    booksData[index] = { ...book, id };
    return booksData[index];
  },

  deleteBook: async (id: string): Promise<void> => {
    await new Promise((res) => setTimeout(res, 500));
    booksData = booksData.filter((b) => b.id !== id);
  },
};
/* BOOK  MANAGEMENT END */
/************************************************************************************************************************************************************************************************************************************************************************************************************************/
