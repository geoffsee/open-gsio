import React from "react";
import {
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useClipboard,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { QRCodeCanvas } from "qrcode.react";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { observer } from "mobx-react-lite";
import clientTransactionStore from "../../stores/ClientTransactionStore";
import DogecoinIcon from "../icons/DogecoinIcon";

const SupportThisSiteModal = observer(({ isOpen, onClose, zIndex }) => {
  const { hasCopied, onCopy } = useClipboard(
    clientTransactionStore.depositAddress || "",
  );
  const toast = useToast();

  const handleCopy = () => {
    if (clientTransactionStore.depositAddress) {
      onCopy();
      toast({
        title: "Address Copied!",
        description: "Thank you for your support!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleConfirmAmount = async () => {
    try {
      await clientTransactionStore.prepareTransaction();
      toast({
        title: "Success",
        description: `Use your wallet app (Coinbase, ...ect) to send the selected asset to the provided address.`,
        status: "success",
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "There was an issue preparing your transaction.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const donationMethods = [
    {
      name: "Ethereum",
      icon: FaEthereum,
    },
    {
      name: "Bitcoin",
      icon: FaBitcoin,
    },
    {
      name: "Dogecoin",
      icon: DogecoinIcon,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      motionPreset="slideInBottom"
      zIndex={zIndex}
    >
      <ModalOverlay />
      <ModalContent bg="gray.800" color="text.primary">
        <ModalHeader textAlign="center" mb={2}>
          Support
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={8} align="center">
            <Text fontSize="md" textAlign="center">
              Your contributions are fuel for magic.
            </Text>
            <Tabs
              align="center"
              variant="soft-rounded"
              colorScheme="teal"
              isFitted
            >
              <TabList mb={2} w={"20%"}>
                {donationMethods.map((method) => (
                  <Tab
                    p={4}
                    key={method.name}
                    onClick={() => {
                      clientTransactionStore.setSelectedMethod(method.name);
                    }}
                  >
                    <Box p={1} w={"fit-content"}>
                      <method.icon />{" "}
                    </Box>
                    {method.name}
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {donationMethods.map((method) => (
                  <TabPanel key={method.name}>
                    {!clientTransactionStore.userConfirmed ? (
                      <VStack spacing={4}>
                        <Text>Enter your information:</Text>
                        <Input
                          placeholder="Your name"
                          value={
                            clientTransactionStore.donerId as string | undefined
                          }
                          onChange={(e) =>
                            clientTransactionStore.setDonerId(e.target.value)
                          }
                          type="text"
                          bg="gray.700"
                          color="white"
                          w="100%"
                        />
                        <Text>Enter the amount you wish to donate:</Text>
                        <Input
                          placeholder="Enter amount"
                          value={
                            clientTransactionStore.amount as number | undefined
                          }
                          onChange={(e) =>
                            clientTransactionStore.setAmount(e.target.value)
                          }
                          type="number"
                          bg="gray.700"
                          color="white"
                          w="100%"
                        />
                        <Button
                          onClick={handleConfirmAmount}
                          size="md"
                          colorScheme="teal"
                        >
                          Confirm Amount
                        </Button>
                      </VStack>
                    ) : (
                      <>
                        <Box
                          bg="white"
                          p={2}
                          borderRadius="lg"
                          mb={4}
                          w={"min-content"}
                        >
                          <QRCodeCanvas
                            value={
                              clientTransactionStore.depositAddress as string
                            }
                            size={180}
                          />
                        </Box>

                        <Box
                          bg="gray.700"
                          p={4}
                          borderRadius="md"
                          wordBreak="unset"
                          w="100%"
                          textAlign="center"
                          mb={4}
                        >
                          <Text fontWeight="bold" fontSize="xs">
                            {clientTransactionStore.depositAddress}
                          </Text>
                        </Box>
                        <Button
                          onClick={handleCopy}
                          size="md"
                          colorScheme="teal"
                          mb={4}
                        >
                          {hasCopied ? "Address Copied!" : "Copy Address"}
                        </Button>
                        <Text fontSize="md" fontWeight="bold">
                          Transaction ID: {clientTransactionStore.txId}
                        </Text>
                      </>
                    )}
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose} colorScheme="gray">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default SupportThisSiteModal;
