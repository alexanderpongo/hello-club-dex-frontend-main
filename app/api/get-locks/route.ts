import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { address, url } = body;

  if (!address || !url) {
    return NextResponse.json({ message: "Missing id or url" }, { status: 400 });
  }

  try {
    // const QUERY = `
    //        query MyQuery {
    //           lpLocks (orderBy: unlockTime, orderDirection: asc, skip: ${0}, first: ${1000},where: {owner: "${address}"})  {
    //               id
    //               owner
    //               tokenId
    //               unlockTime
    //               blockNumber
    //               blockTimestamp
    //               transactionHash
    //           }
    //       }
    //       `;

    const QUERY = `   query MyQuery {
  lpLocks(
    orderBy: unlockTime
    where: {owner: "${address}"}
    orderDirection: asc
    first: 1000
  ) {
    id
    owner
    tokenId
    transactionHash
    unlockTime
    blockTimestamp
  }
}
  `;

    const response = await axios.post(url, { query: QUERY });

    // console.log("user locks:", response);

    const userLocks = response.data?.data?.lpLocks;

    if (userLocks && Array.isArray(userLocks)) {
      return NextResponse.json(
        {
          status: 200,
          message: "success",
          data: userLocks,
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      return NextResponse.json(
        { message: "No collects data found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { message: "Failed to fetch or process data" },
      { status: 500 }
    );
  }
}
