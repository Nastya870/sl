import { useState, useCallback, useEffect } from 'react';
import { getAllUsers, deleteUser } from 'api/users';

export const useUsersTableData = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [totalUsers, setTotalUsers] = useState(0);
    const [search, setSearch] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await getAllUsers({
            page: page + 1,
            pageSize: rowsPerPage,
            search
          });

          setUsers(response.data || []);
          setTotalUsers(response.total || 0);
        } catch (err) {
          console.error('Error fetching users:', err);
          setError(err.response?.data?.message || 'Ошибка загрузки пользователей');
        } finally {
          setLoading(false);
        }
    }, [page, rowsPerPage, search]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteUser = async (userId) => {
        await deleteUser(userId);
        fetchUsers();
    };

    return {
        users,
        loading,
        error,
        page,
        rowsPerPage,
        totalUsers,
        search,
        setSearch,
        handleSearchChange,
        handleChangePage,
        handleChangeRowsPerPage,
        handleDeleteUser,
        refresh: fetchUsers
    };
};
