import {
    Button,
    Container,
    Text,
    Title,
    Modal,
    TextInput,
    Group,
    Card,
    ActionIcon,
    Grid,
    Code,
} from '@mantine/core';

import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core';

import React, { useState, useRef, useEffect } from 'react';
import { MoonStars, Sun, Trash, Ballpen } from 'tabler-icons-react';
// import { useColorScheme } from '@mantine/hooks';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import TextEditor from "./TextEditor";
import { v4 as uuidv4 } from 'uuid';

export default function ToDo() {
    const [tasks, setTasks] = useState([]);
    const [opened, setOpened] = useState(false);
    const [currentContent, setCurrentContent] = useState("");
    const [currentId, setCurrentId] = useState("");

    let editorContent = "";

    // const preferredColorScheme = useColorScheme();
    const [colorScheme, setColorScheme] = useLocalStorage({
        key: 'mantine-color-scheme',
        defaultValue: 'light',
        getInitialValueInEffect: true,
    });
    const toggleColorScheme = value =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

    useHotkeys([['mod+J', () => toggleColorScheme()]]);

    const taskTitle = useRef('');
    const taskSummary = useRef('');

    function toggleCurrentCard(id) {
        setTasks((prevTasks) => {
            const updatedTasks = prevTasks.map((task) => ({
                ...task,
                isSelected: task.id === id
            }));
            setCurrentId(id);
            saveTasks(updatedTasks);
            return updatedTasks;
        });
        for (let task of tasks) {
            if (task.id === id) setCurrentContent(task.content);
        }
    }

    function createTask() {
        const newTask = {
                title: taskTitle.current.value,
                summary: taskSummary.current.value,
                isSelected: false,
                content: "",
                id: uuidv4()
            };
        setTasks([
            ...tasks,
            newTask
        ]);

        saveTasks([
            ...tasks,
            newTask
        ]);
    }

    function deleteTask(index) {
        let clonedTasks = [...tasks];

        clonedTasks.splice(index, 1);

        setTasks(clonedTasks);

        saveTasks([...clonedTasks]);
    }

    function getCurrentContent(content) {
        editorContent = content;
    }

    function saveCurrentTask() {
        setTasks((prev) => {
            const updatedTasks = prev.map((card) =>
                card.id === currentId ? { ...card, content: editorContent } : card
            );
            saveTasks(updatedTasks);
            return updatedTasks;
        });
    }

    function ActionIcons(props) {
        return (
            <Grid gutter= {{ base: 5, xs: 'md', md: 'xl', xl: 50 }}>
                <Grid.Col span={7}>
                    <ActionIcon
                        onClick={() => {
                            toggleCurrentCard(props.task.id);
                        }}
                        color={'red'}
                        variant={'transparent'}>
                        <Ballpen />
                    </ActionIcon>
                </Grid.Col>

                <Grid.Col span = {2}>
                    <ActionIcon
                        onClick={() => {
                            deleteTask(props.index);
                        }}
                        color={'red'}
                        variant={'transparent'}>
                        <Trash />
                    </ActionIcon>
                </Grid.Col>
            </Grid>
        )
    }

    function handleSave() {
        saveCurrentTask();
        setCurrentContent(editorContent);
    }

    function loadTasks() {
        let loadedTasks = localStorage.getItem('tasks');

        let tasks = JSON.parse(loadedTasks);

        if (tasks) {
            setTasks(tasks);
        }
    }

    function saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    useEffect(() => {
        loadTasks();
    }, []);


    function ToDoBar() {
        return (
            <ColorSchemeProvider
                colorScheme={colorScheme}
                toggleColorScheme={toggleColorScheme}>
                <MantineProvider
                    theme={{ colorScheme, defaultRadius: 'md' }}
                    withGlobalStyles
                    withNormalizeCSS>
                    <div className='App'>
                        <Modal
                            opened={opened}
                            size={'md'}
                            title={'New Task'}
                            withCloseButton={false}
                            onClose={() => {
                                setOpened(false);
                            }}
                            centered>
                            <TextInput
                                mt={'md'}
                                ref={taskTitle}
                                placeholder={'Task Title'}
                                required
                                label={'Title'}
                            />
                            <TextInput
                                ref={taskSummary}
                                mt={'md'}
                                placeholder={'Task Summary'}
                                label={'Summary'}
                            />
                            <Group mt={'md'} position={'apart'}>
                                <Button
                                    onClick={() => {
                                        setOpened(false);
                                    }}
                                    variant={'subtle'}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        createTask();
                                        setOpened(false);
                                    }}>
                                    Create Task
                                </Button>
                            </Group>
                        </Modal>
                        <Container size={550} my={40}>
                            <Group position={'apart'}>
                                <Title
                                    sx={theme => ({
                                        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                                        fontWeight: 900,
                                    })}>
                                    Foxy To-Do
                                </Title>
                                <ActionIcon
                                    color={'blue'}
                                    onClick={() => toggleColorScheme()}
                                    size='lg'>
                                    {colorScheme === 'dark' ? (
                                        <Sun size={16} />
                                    ) : (
                                        <MoonStars size={16} />
                                    )}
                                </ActionIcon>
                            </Group>
                            {tasks.length > 0 ? (
                                tasks.map((task, index) => {
                                    if (task.title) {
                                        return (
                                            <Card key={index} mt={'sm'} shadow={task.isSelected ? "sm": "none"} withBorder={task.isSelected}>
                                                <Group position={'apart'}>
                                                    <Text weight={'bold'}>{task.title}</Text>
                                                    <ActionIcons index={index} task={task}/>
                                                </Group>
                                                <Text color={'dimmed'} size={'md'} mt={'sm'}>
                                                    {task.summary
                                                        ? task.summary
                                                        : 'No summary was provided for this task'}
                                                </Text>
                                            </Card>
                                        );
                                    }
                                })
                            ) : (
                                <Text size={'lg'} mt={'md'} color={'dimmed'}>
                                    You have no tasks
                                </Text>
                            )}
                            <Button
                                onClick={() => {
                                    setOpened(true);
                                }}
                                fullWidth
                                mt={'md'}>
                                New Task
                            </Button>
                        </Container>
                    </div>
                </MantineProvider>
            </ColorSchemeProvider>
        );
    }

    function Editor(props) {
        return (
            <ColorSchemeProvider
                colorScheme={colorScheme}
                toggleColorScheme={toggleColorScheme}>
                <MantineProvider
                    theme={{ colorScheme, defaultRadius: 'md' }}
                    withGlobalStyles
                    withNormalizeCSS>
                    <TextEditor content={currentContent} getContent={getCurrentContent}  handleSave = {handleSave}/>
                </MantineProvider>
            </ColorSchemeProvider>
        )
    }

    return (
        <Grid>
            <Grid.Col span={4}><ToDoBar /></Grid.Col>
            <Grid.Col span={8}><Editor /></Grid.Col>
        </Grid>

    );

}
