import { useEffect, useId, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "../components/layouts/MainLayout";
import useDocumentTitle from "../components/useDocumentTitle";
import { roadmaps } from "../roadmaps/roadmaps";
import { data as frontendData } from "../roadmaps/frontend";
import { data as reactData } from "../roadmaps/react";
import { data as backendData } from "../roadmaps/backend";
import { data as devopsData } from "../roadmaps/devops";
import { data as communityData } from "../roadmaps/community";
import { dataEngineeringData } from "../roadmaps/dataEngineering";
import { Level, RoadmapItem } from "../entity/RoadmapModel";
import { FaArrowLeft, FaArrowRight, FaRegCircle } from "react-icons/fa";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Checkbox,
  CheckboxGroup,
  Flex,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { getColorFromContentType } from "../support/contentType";
import { emojisplosion } from "emojisplosion";
import { useLocalStorage } from "react-use";
import { CheckIcon } from "@chakra-ui/icons";
import HorizontalLevelItem from "../components/HorizontalRoadmap/HorizontalLevelItem/HorizontalLevelItem";
import HorizontalRoadmapFooter from "../components/HorizontalRoadmap/HorizontalRoadmapFooter/HorizontalRoadmapFooter";
import Note from "../components/Note/Note";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import Header from "../components/Header/Header";

export default function HorizontalRoadmapPage() {
  const { name } = useParams<string>();
  const [roadmapName, setRoadmapName] = useState("");
  const [roadmapData, setRoadmapData] = useState<Level[]>();
  const [roadmapLevel, setRoadmapLevel] = useState<Level>();
  const [selectedItem, setSelectedItem] = useState<RoadmapItem>();
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>();
  const [selectedItems, setSelectedItems, remove] = useLocalStorage(
    "selectedItems",
    {} as { [key: string]: boolean }
  );
  const roadmaps: any = {
    frontend: { file: frontendData, title: "Frontend" },
    react: { file: reactData, title: "React" },
    backend: { file: backendData, title: "Backend" },
    devops: { file: devopsData, title: "Devops" },
    dataEngineer: { file: dataEngineeringData, title: "Data Engineer" },
    community: { file: communityData, title: "Comunidade" },
  };

  useEffect(() => {
    const handleMouseMove = (event: { clientX: any; clientY: any }) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (name) {
      setRoadmapName(name);
      setRoadmapData(roadmaps[name].file);
      setRoadmapLevel(roadmaps[name].file[currentLevelIndex]);
    }
  }, [name]);

  useEffect(() => {
    if (roadmapData && roadmapLevel) {
      setCurrentLevelIndex(roadmapData.indexOf(roadmapLevel));
    }
  }, [roadmapLevel]);

  useEffect(() => {
    if (localStorage.getItem("selectedItems")) {
      setSelectedItems(
        JSON.parse(localStorage.getItem("selectedItems") || "") || {}
      );
    }
  }, []);

  useDocumentTitle("Trilha Info - " + roadmaps[name || ""].title);

  // LevelItem Functions START

  function isAllContentRead(label: string, contentLength: number) {
    if (selectedItems) {
      const contentRead = Object.keys(selectedItems).filter(
        (key) => key.endsWith("-" + label) && selectedItems[key] === true
      );
      return contentRead.length === contentLength;
    }

    return false;
  }

  function checkAllContent(label: string, check: boolean) {
    roadmapData?.forEach((level) => {
      level.items.forEach((item) => {
        if (item.label === label) {
          item.children?.forEach((child) => {
            saveRead(child.label + "-" + item.label, check);
          });
        }
      });
    });

    if (check) {
      emojisplosion({
        emojiCount: 1,
        uniqueness: 1,
        position: {
          x: mousePos?.x || innerWidth / 2,
          y: mousePos?.y || innerHeight / 2,
        },
        emojis: ["🎉", "🎊", "🎈", "🤓"],
      });
    }
  }

  function saveRead(label: string, checked: boolean) {
    let selected = selectedItems;
    if (!selected) {
      selected = {};
    }
    selected[label] = checked;
    setSelectedItems(selected);
    localStorage.setItem("selectedItems", JSON.stringify(selected));

    if (checked) {
      emojisplosion({
        emojiCount: 1,
        uniqueness: 1,
        position: {
          x: mousePos?.x || innerWidth / 2,
          y: mousePos?.y || innerHeight / 2,
        },
        emojis: ["🎉", "🎊", "🎈", "🤓"],
      });
    }
  }

  function isRead(label: string) {
    if (selectedItems) {
      return selectedItems[label];
    }
    return false;
  }
  // LevelItem Functions END

  function handleNextLevel() {
    if (roadmapData && currentLevelIndex < roadmapData.length - 1) {
      setRoadmapLevel(roadmapData[currentLevelIndex + 1]);
      setSelectedItem(undefined);
    }
  }

  function handlePreviousLevel() {
    if (roadmapData && currentLevelIndex >= 1) {
      setRoadmapLevel(roadmapData[currentLevelIndex - 1]);
      setSelectedItem(undefined);
    }
  }

  function handleSelectItem(item: RoadmapItem) {
    setSelectedItem(item);
  }

  function handleNavigateLevel(index: number) {
    if (roadmapData) {
      setRoadmapLevel(roadmapData[index]);
      setSelectedItem(undefined);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex flex-col w-11/12 mx-auto relative overflow-x-hidden">
        <AnimatePresence>
          <LevelComp
            key={roadmapLevel?.items[0].label}
            {...(roadmapLevel as Level)}
          />
        </AnimatePresence>
      </main>

      <footer className="text-center py-4 w-full bg-dark-brown select-none mt-auto">
        <span className="c-brown">Idealizado por </span>
        <ChakraLink
          isExternal
          color={"#ee8561"}
          href="https://github.com/flaviojmendes"
        >
          flaviojmendes
        </ChakraLink>
        <span className="c-brown">
          {" "}
          e mantido pela{" "}
          <Link style={{ color: "#ee8561" }} to={"/roadmap/community"}>
            comunidade
          </Link>
          . Esse app foi inspirado em{" "}
          <a
            style={{ color: "#ee8561" }}
            target="_blank"
            href={"https://roadmap.sh"}
          >
            roadmap.sh
          </a>
        </span>
      </footer>
    </div>
  );
}

const MotionTabs = motion(Tabs);

const LevelComp = ({ label, description, items }: Level) => {
  return (
    <MotionTabs
      variant="unstyled"
      className="!flex gap-4 absolute inset-0 mt-8"
      initial={{ x: 200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -200, opacity: 0 }}
    >
      <TabList className="flex !flex-col items-center gap-4 max-w-[308px] w-full">
        <p className="text-yellow txt-title text-xl text-center">{label}</p>
        <p className="text-yellow txt-title text-center">{description}</p>
        <div className="flex flex-col gap-2 w-full">
          {items?.map((item, index) => (
            <Tab
              key={index}
              className="border-2 flex !justify-start w-fit xl:w-full bg-light-brown border-red p-2 xl:p-4 pl-1 cursor-pointer hover:bg-white rounded-md min-h-[64px]"
            >
              <FaRegCircle className="mx-1 hover:text-light-orange hover:fill-light-orange checking" />
              <p className="ml-1 xl:ml-2 txt-title text-xl">{item.label}</p>
              <p className="txt-title text-xl ml-auto">{">>"}</p>
            </Tab>
          ))}
        </div>
      </TabList>
      <TabPanels className="">
        {items?.map((item, index) => (
          <TabPanel key={index} className="">
            <div className="flex flex-col px-4">
              <h2 className="txt-title text-2xl text-light-orange">
                {item.label}
              </h2>
              <p className="txt-title text-xl text-light-orange mt-2">
                {item.description}
              </p>
              <Accordion className="mt-4" allowToggle>
                {item?.children?.map((child) => {
                  return (
                    <AccordionItem key={child.label}>
                      <h2 className="font-semibold">
                        <AccordionButton color={"#e9dad5"}>
                          <Box flex="1" textAlign="left">
                            <CheckboxGroup>
                              <Checkbox
                                className="my-auto mr-2"
                                size={"lg"}
                                /* isChecked={isRead(key)} */
                                /* onChange={(e) => { */
                                /*   saveRead(key, e.target.checked); */
                                /* }} */
                              ></Checkbox>
                            </CheckboxGroup>
                            <span className="text-light-brown txt-title">
                              {child.label}
                            </span>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        {child.links?.length
                          ? child.links?.map((link, index) => {
                              return (
                                <React.Fragment key={index}>
                                  <Flex className="my-2">
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      className="text-light-brown hover:underline"
                                    >
                                      {link.label}
                                    </a>
                                    <Spacer />
                                    <Badge
                                      colorScheme={getColorFromContentType(
                                        link.contentType
                                      )}
                                      p={1}
                                      rounded={"md"}
                                      className="h-5"
                                      fontSize="0.6em"
                                      mr="1"
                                      cursor={"default"}
                                    >
                                      <span>
                                        {link.contentType
                                          ? link.contentType
                                          : null}
                                      </span>
                                    </Badge>
                                  </Flex>
                                </React.Fragment>
                              );
                            })
                          : "Ainda não possuimos conteúdo."}
                      </AccordionPanel>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </TabPanel>
        ))}
      </TabPanels>
    </MotionTabs>
  );
};
